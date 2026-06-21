#!/bin/bash
# scripts/deploy.sh - Complete deployment script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting SmartAppraisal Deployment${NC}"

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker is required but not installed.${NC}" >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo -e "${RED}❌ Docker Compose is required but not installed.${NC}" >&2; exit 1; }

# Create required directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs data/backup data/models data/exports monitoring/grafana/dashboards monitoring/grafana/datasources ssl

# Generate SSL certificates if not exists
if [ ! -f ssl/appraisal.crt ] || [ ! -f ssl/appraisal.key ]; then
    echo -e "${YELLOW}🔐 Generating SSL certificates...${NC}"
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/appraisal.key \
        -out ssl/appraisal.crt \
        -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Company/CN=appraisal.company.com"
fi

# Set permissions
echo -e "${YELLOW}🔧 Setting permissions...${NC}"
chmod 600 ssl/appraisal.key
chmod 644 ssl/appraisal.crt

# Pull latest images
echo -e "${YELLOW}📦 Pulling latest images...${NC}"
docker-compose -f docker-compose.prod.yml pull

# Stop and remove old containers
echo -e "${YELLOW}🛑 Stopping old containers...${NC}"
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Start new containers
echo -e "${YELLOW}▶️  Starting containers...${NC}"
docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database...${NC}"
sleep 10

# Run database migrations
echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend alembic upgrade head

# Initialize seed data
echo -e "${YELLOW}🌱 Seeding initial data...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend python scripts/seed_data.py

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 5

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
    exit 1
fi

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    exit 1
fi

# Show status
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}🌐 Frontend: https://appraisal.company.com${NC}"
echo -e "${GREEN}🔧 API: https://api.appraisal.company.com${NC}"
echo -e "${GREEN}📊 Grafana: http://localhost:3001${NC}"
echo -e "${GREEN}📈 Prometheus: http://localhost:9090${NC}"

# Display container status
echo -e "\n${YELLOW}Container Status:${NC}"
docker-compose -f docker-compose.prod.yml ps

# Show logs
echo -e "\n${YELLOW}Recent logs (backend):${NC}"
docker-compose -f docker-compose.prod.yml logs --tail=20 backend
