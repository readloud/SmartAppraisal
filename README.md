# 📱 SmartAppraisal - Internal Appraisal & Pricing System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-24.0-blue.svg)](https://www.docker.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> **AI-Ready Enterprise System for Smartphone Appraisal & Pricing**
> 
> A comprehensive web-based internal system for standardizing smartphone/tablet appraisal processes with built-in AI readiness for future machine learning integration.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Rule Engine](#-rule-engine)
- [AI/ML Integration](#-aiml-integration)
- [Monitoring & Observability](#-monitoring--observability)
- [Testing](#-testing)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

**SmartAppraisal** is an enterprise-grade internal system designed for companies in the used smartphone/tablet market. It standardizes the appraisal process, automates pricing recommendations, and provides a robust foundation for AI-powered pricing engines.

### Business Problem
- ❌ Manual price determination leads to inconsistencies
- ❌ Different valuations between employees
- ❌ Risk of overpaying (loss) or underpaying (customer dissatisfaction)
- ❌ No centralized data for analysis and AI training

### Our Solution
- ✅ Standardized appraisal workflow
- ✅ Rule-based pricing recommendations
- ✅ Centralized transaction database
- ✅ AI-ready architecture for future ML pricing
- ✅ Comprehensive analytics and reporting

---

## ✨ Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Multi-user Authentication** | Admin and Karyawan roles with JWT authentication | ✅ |
| **Master Data Management** | Brands, Models, Variants, Colors, Conditions, Accessories | ✅ |
| **Unit Appraisal** | Comprehensive form with all required attributes | ✅ |
| **Rule-based Pricing** | Weighted scoring system with multiple factors | ✅ |
| **Transaction Management** | Complete transaction lifecycle tracking | ✅ |
| **Search & History** | Advanced search with filters and historical data | ✅ |
| **Dashboard** | Real-time KPIs, charts, and activity feed | ✅ |
| **Reports & Export** | Excel/CSV export with customizable filters | ✅ |
| **AI Training Data** | Automatic collection of training data | ✅ |
| **Audit Logging** | Complete audit trail for all actions | ✅ |

### Advanced Features

- **Dynamic Pricing Engine**: Weighted rule-based recommendations
- **Market Data Integration**: Real-time price comparison
- **Inventory Management**: Track unit status and aging
- **Analytics Dashboard**: Business intelligence and KPIs
- **Export Capabilities**: Excel, CSV, PDF reports
- **WebSocket Support**: Real-time updates
- **Rate Limiting**: API protection
- **Multi-environment Support**: Dev, Staging, Production

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (React.js)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ Dashboard│ │ Appraisal│ │Transact. │ │ Reports  │ │ Settings │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Gateway (Nginx)                             │
│                   ┌─────────────────────────────┐                     │
│                   │   SSL Termination / Rate     │                     │
│                   │   Limiting / Load Balancing  │                     │
│                   └─────────────────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Backend (FastAPI)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Auth    │ │  Master  │ │Appraisal │ │Transaction││ Reports  │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     Rule Engine / Pricing                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                AI/ML Training Data Collector                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       Data Layer (PostgreSQL + Redis)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │  Users   │ │  Master  │ │  Units   │ │Transact. │ │  Audit   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     Redis Cache Layer                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Monitoring & Observability                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Prometheus│ │ Grafana  │ │ Alert    │ │  Loki    │ │  ELK     │   │
│  │          │ │          │ │ Manager  │ │          │ │  Stack   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM with async support
- **PostgreSQL** - Primary database
- **Redis** - Caching and session management
- **Celery** - Background task queue
- **Alembic** - Database migrations
- **Pydantic** - Data validation
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **Tailwind CSS** - Styling framework
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Recharts** - Data visualization
- **React Router v6** - Navigation
- **Axios** - HTTP client
- **Framer Motion** - Animations

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancing
- **GitHub Actions** - CI/CD pipeline
- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Loki** - Log aggregation

### Testing
- **Pytest** - Python testing
- **Jest** - JavaScript testing
- **Playwright** - E2E testing
- **k6** - Load testing
- **Locust** - Performance testing

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
- Docker 24.0+
- Docker Compose 2.20+
- Git 2.40+
- Make (optional)

# For local development
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
```

### One-Line Deployment

```bash
# Clone and deploy with one command
git clone https://github.com/yourcompany/smartappraisal.git
cd smartappraisal
./scripts/deploy.sh

# Or using Make
make deploy
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourcompany/smartappraisal.git
cd smartappraisal

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start development environment
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed database
docker-compose exec backend python scripts/seed_data.py

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# PGAdmin: http://localhost:5050
```

---

## 📦 Installation

### Option 1: Docker (Recommended)

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d

# With monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d
```

### Option 2: Manual Installation

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development

# Setup database
createdb appraisal
alembic upgrade head

# Seed data
python scripts/seed_data.py

# Run server
uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Option 3: Using Makefile

```bash
# Available commands
make help           # Show all commands
make setup          # Setup development environment
make start          # Start all services
make stop           # Stop all services
make logs           # View logs
make test           # Run all tests
make migrate        # Run database migrations
make seed           # Seed database
make build          # Build production images
make deploy         # Deploy to production
make backup         # Backup database
make monitor        # Start monitoring stack
make clean          # Clean up Docker resources
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# ============================================
# Database
# ============================================
DB_NAME=appraisal
DB_USER=appraiser
DB_PASSWORD=secure_password_change_me
DB_HOST=postgres
DB_PORT=5432

# ============================================
# Redis
# ============================================
REDIS_PASSWORD=secure_redis_password_change_me
REDIS_HOST=redis
REDIS_PORT=6379

# ============================================
# Application
# ============================================
SECRET_KEY=your_super_secret_key_min_32_characters
DEBUG=False
ALLOWED_ORIGINS=https://appraisal.company.com
API_PREFIX=/api
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ============================================
# AI/ML
# ============================================
USE_AI_MODEL=False
ML_MODEL_PATH=/app/models/pricing_model.h5
TRAINING_DATA_PATH=/app/data/training_data.csv

# ============================================
# Email
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=your_smtp_password
SMTP_FROM=noreply@company.com

# ============================================
# Monitoring
# ============================================
GRAFANA_PASSWORD=admin123
PROMETHEUS_RETENTION=15d

# ============================================
# Logging
# ============================================
LOG_LEVEL=INFO
LOG_FILE=/app/logs/app.log
LOG_FORMAT=json

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_PER_MINUTE=100
LOGIN_RATE_LIMIT_PER_MINUTE=5

# ============================================
# Export
# ============================================
EXPORT_MAX_ROWS=10000
EXPORT_TEMP_PATH=/tmp/exports

# ============================================
# Feature Flags
# ============================================
ENABLE_WEBSOCKETS=True
ENABLE_EXPORT=True
ENABLE_AI_TRAINING=True
```

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/app/core/config.py` | Backend configuration |
| `frontend/src/config/index.js` | Frontend configuration |
| `nginx/nginx.conf` | Nginx server configuration |
| `postgres/postgresql.conf` | PostgreSQL configuration |
| `redis/redis.conf` | Redis configuration |
| `prometheus/prometheus.yml` | Prometheus configuration |
| `docker-compose.prod.yml` | Production service configuration |

---

## 🚢 Deployment

### Production Deployment

```bash
# 1. Setup SSL certificates
./scripts/generate-ssl.sh

# 2. Configure environment
cp .env.example .env
# Edit .env with production values

# 3. Deploy
./scripts/deploy.sh

# 4. Verify deployment
curl https://appraisal.company.com/health

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Scaling

```bash
# Scale backend horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale celery-worker=5

# Scale frontend
docker-compose -f docker-compose.prod.yml up -d --scale frontend=2
```

### Backup & Restore

```bash
# Backup database
./scripts/backup.sh

# Restore database
./scripts/restore.sh backup_file.sql.gz

# Backup all data (including files)
tar -czf full_backup_$(date +%Y%m%d).tar.gz data/ logs/ .env
```

### Rollback

```bash
# Rollback to previous version
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml pull backend:previous
docker-compose -f docker-compose.prod.yml up -d

# Rollback database migration
docker-compose exec backend alembic downgrade -1
```

---

## 📚 API Documentation

### Interactive API Docs

Once the backend is running, access:

- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### API Overview

| Endpoint Group | Description | Authentication |
|----------------|-------------|----------------|
| `/api/auth` | Authentication (login, logout, refresh) | Public |
| `/api/master` | Master data management | JWT Required |
| `/api/appraisal` | Unit appraisal operations | JWT Required |
| `/api/transactions` | Transaction management | JWT Required |
| `/api/dashboard` | Dashboard statistics | JWT Required |
| `/api/reports` | Reports and exports | JWT Required (Admin) |
| `/api/system` | System configuration | JWT Required (Admin) |

### Sample API Calls

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@company.com", "password": "admin123"}'

# Get dashboard stats
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create appraisal
curl -X POST http://localhost:8000/api/appraisal \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_id": "uuid",
    "model_id": "uuid",
    "variant_id": "uuid",
    "color_id": "uuid",
    "physical_condition_id": "uuid",
    "battery_health": 85,
    "accessories": ["uuid1", "uuid2"],
    "notes": "Test appraisal"
  }'

# Export transactions
curl -X GET "http://localhost:8000/api/reports/export?start_date=2024-01-01&end_date=2024-12-31&format=excel" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output transactions.xlsx
```

### Postman Collection

Import `docs/api/postman_collection.json` into Postman for complete API testing.

---

## 🗄 Database Schema

### ER Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │     │   brands    │     │   models    │
│─────────────│     │─────────────│     │─────────────│
│ id          │────>│ id          │────>│ id          │
│ email       │     │ name        │     │ brand_id    │
│ password    │     │ logo_url    │     │ name        │
│ full_name   │     │ is_active   │     │ launch_year │
│ role        │     └─────────────┘     │ release_price│
│ is_active   │                         └─────────────┘
└─────────────┘                               │
      │                                        │
      │                                  ┌─────▼─────┐
      │                                  │ variants  │
      │                                  │───────────│
      │                                  │ id        │
      │                                  │ model_id  │
      │                                  │ ram       │
      │                                  │ rom       │
      │                                  └───────────┘
      │                                        │
      │                                  ┌─────▼─────┐
      │                                  │   units   │
      │                                  │───────────│
      │                                  │ id        │
      │                                  │ imei      │
      ├─────────────────────────────────>│ brand_id  │
      │                                  │ model_id  │
      │                                  │ variant_id│
      │                                  │ color_id  │
      │                                  │ condition │
      │                                  │ battery   │
      │                                  │ purchase  │
      │                                  │ selling   │
      │                                  │ status    │
      │                                  └───────────┘
      │                                        │
      │                                  ┌─────▼─────┐
      │                                  │transact.  │
      │                                  │───────────│
      ├─────────────────────────────────>│ id        │
      │                                  │ unit_id   │
      │                                  │ user_id   │
      │                                  │ purchase  │
      │                                  │ selling   │
      │                                  │ profit    │
      │                                  │ status    │
      └──────────────────────────────────┴───────────┘
```

### Key Tables

| Table | Description | Size Estimate |
|-------|-------------|---------------|
| `users` | User accounts | 10-100 rows |
| `brands` | Device brands | 20-50 rows |
| `models` | Device models | 500-2000 rows |
| `variants` | RAM/ROM combinations | 2000-10000 rows |
| `units` | Individual units | 10K-1M rows |
| `transactions` | Transaction records | 10K-1M rows |
| `audit_logs` | Audit trail | 100K-10M rows |
| `ml_training_data` | AI training data | 10K-100K rows |

---

## 🧠 Rule Engine

### Pricing Algorithm

The rule engine uses a weighted scoring system to calculate suggested prices:

```
Suggested Price = Base Price × (1 + Σ Adjustments)

Where:
- Base Price = Market Average (30-day) or Fallback
- Adjustments = Weighted sum of factors:
  - Physical Condition: ±30%
  - Battery Health: ±15%
  - Completeness: ±20%
  - Market Demand: ±20%
  - Device Age: ±15%
```

### Configuration

```python
# backend/app/services/rule_engine.py

weights = {
    'physical_condition': 0.30,
    'battery_health': 0.15,
    'completeness': 0.20,
    'market_demand': 0.20,
    'device_age': 0.15
}

# Adjustment ranges
condition_adjustment = {
    'Mint': 0.10,
    'Excellent': 0.05,
    'Good': 0.00,
    'Fair': -0.10,
    'Poor': -0.20
}

battery_adjustment = {
    90: 0.05,
    80: 0.03,
    70: 0.00,
    60: -0.05,
    0: -0.10
}
```

### Customization

The rule engine can be customized via:

1. **System Configs Table**: Modify weights and thresholds
2. **Environment Variables**: Override default values
3. **Admin Interface**: Web-based configuration (coming soon)
4. **API Endpoints**: Programmatic updates

---

## 🤖 AI/ML Integration

### AI-Ready Architecture

The system is designed to seamlessly integrate machine learning models:

1. **Data Collection**: All appraisal data is stored in `ml_training_data` table
2. **Feature Engineering**: Pre-computed features for training
3. **Model Repository**: Placeholder for trained models
4. **Inference Pipeline**: Can switch between rule-based and AI predictions

### Training Data Schema

```sql
-- ml_training_data table structure
CREATE TABLE ml_training_data (
    id UUID PRIMARY KEY,
    unit_id UUID REFERENCES units(id),
    features JSONB NOT NULL,
    actual_price NUMERIC(15,2) NOT NULL,
    predicted_price NUMERIC(15,2),
    model_version VARCHAR(50),
    is_used_for_training BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Feature Set

```json
{
  "brand_id": "uuid",
  "model_id": "uuid", 
  "variant_id": "uuid",
  "physical_condition_score": 85,
  "battery_health": 92,
  "accessories_count": 5,
  "device_age": 1,
  "market_transactions": 45,
  "demand_score": 78,
  "release_price": 12000000,
  "days_since_release": 365
}
```

### Training Pipeline (Future)

```python
# ML Pipeline (Phase 2)
1. Data Collection → 2. Feature Engineering → 3. Model Training
4. Model Validation → 5. Model Deployment → 6. Inference
```

---

## 📊 Monitoring & Observability

### Metrics Collected

| Category | Metrics | Purpose |
|----------|---------|---------|
| **Application** | Request rate, errors, latency | Performance monitoring |
| **Business** | Transactions, profit, appraisal | Business intelligence |
| **Database** | Connections, queries, cache hit | Database health |
| **Infrastructure** | CPU, memory, disk, network | System health |
| **Security** | Failed logins, rate limits | Security monitoring |

### Dashboards

Access dashboards at:
- **Application Dashboard**: `http://localhost:3001/d/smartappraisal-app`
- **Infrastructure Dashboard**: `http://localhost:3001/d/smartappraisal-infra`

### Alerts

Configured alerts for:
- Service downtime
- High error rates
- Slow response times
- Resource exhaustion
- Security events
- Business KPIs

### Logging

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Search logs
docker-compose logs backend | grep ERROR

# View in Grafana Loki
# Access: http://localhost:3001/explore
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
pytest -v --cov=app --cov-report=html

# Frontend tests
cd frontend
npm test -- --coverage --watchAll=false

# E2E tests (Playwright)
npx playwright test

# Performance/Load tests
k6 run tests/performance/load-test.js

# API performance test
python tests/performance/api-performance.py
```

### Test Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Frontend coverage
npm test -- --coverage
open coverage/lcov-report/index.html
```

### Test Structure

```
tests/
├── unit/               # Unit tests
│   ├── test_auth.py
│   ├── test_master.py
│   └── test_rule_engine.py
├── integration/        # Integration tests
│   ├── test_api.py
│   └── test_services.py
├── e2e/               # End-to-end tests
│   ├── login.spec.js
│   └── appraisal.spec.js
└── performance/       # Performance tests
    ├── load-test.js
    └── stress-test.js
```

---

## 🔒 Security

### Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | JWT with refresh tokens |
| **Password Hashing** | Bcrypt (12 rounds) |
| **Session Management** | Redis-backed sessions |
| **CORS** | Configurable allowed origins |
| **Rate Limiting** | Per-user and per-endpoint |
| **Input Validation** | Pydantic schemas |
| **SQL Injection** | SQLAlchemy ORM |
| **XSS Protection** | React default + CSP |
| **CSRF** | SameSite cookies |
| **Audit Logging** | Complete audit trail |
| **Encryption** | SSL/TLS for all traffic |

### Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header Content-Security-Policy "default-src 'self'";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Security Scanning

```bash
# Run security scan
./scripts/security-scan.sh

# Check dependencies
npm audit
pip-audit

# Container scanning
docker scan backend:latest
docker scan frontend:latest

# Static analysis
bandit -r backend/
npm run lint -- --security
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** with conventional commits
7. **Push** to your fork
8. **Create** a pull request

### Commit Convention

```bash
# Format
<type>(<scope>): <subject>

# Types
feat: New feature
fix: Bug fix
docs: Documentation
style: Code style
refactor: Code refactor
perf: Performance
test: Testing
chore: Maintenance

# Examples
feat(appraisal): add battery health validation
fix(auth): resolve token expiration bug
docs(api): update endpoint documentation
```

### Development Standards

- **Python**: PEP 8, Black formatting, type hints
- **JavaScript**: ESLint, Prettier
- **Testing**: 80% minimum coverage
- **Documentation**: Docstrings and comments
- **Performance**: Respect API rate limits
- **Security**: Follow security best practices

### Branch Strategy

```
main (production)
├── develop (staging)
│   ├── feature/appraisal-form
│   ├── feature/dashboard-v2
│   └── fix/auth-bug
└── release/v1.0.0
```

---

## 📞 Support

### Documentation

- **API Reference**: `/api/docs` (Swagger)
- **User Manual**: `docs/user-guide.md`
- **Admin Guide**: `docs/admin-guide.md`
- **Deployment Guide**: `docs/deployment.md`
- **Developer Guide**: `docs/development.md`

### Community

- **GitHub Issues**: [Report issues](https://github.com/yourcompany/smartappraisal/issues)
- **Discussions**: [Community forum](https://github.com/yourcompany/smartappraisal/discussions)
- **Slack**: [Join Slack](https://join.slack.com/t/smartappraisal/shared_invite/...)

### Commercial Support

For enterprise support, SLA, and custom development:

- **Email**: support@company.com
- **Phone**: +62 21 1234 5678
- **Website**: https://company.com

### Emergency Contact

- **Critical Issues**: +62 812 3456 7890 (24/7)
- **Security Issues**: security@company.com

---

## 📊 Project Status

### Current Version: v1.0.0

| Component | Status | Version |
|-----------|--------|---------|
| Backend API | ✅ Stable | 1.0.0 |
| Frontend UI | ✅ Stable | 1.0.0 |
| Rule Engine | ✅ Stable | 1.0.0 |
| Database | ✅ Stable | 1.0.0 |
| Monitoring | ✅ Stable | 1.0.0 |
| AI/ML Integration | 🚧 In Progress | 0.5.0 |
| Mobile App | 🚧 In Progress | 0.3.0 |

### Roadmap

#### Q1 2024
- ✅ Core system launch
- ✅ Rule-based pricing
- ✅ Dashboard and reporting

#### Q2 2024
- ✅ AI pricing model (Phase 1)
- ✅ Mobile app (iOS/Android)
- ✅ Advanced analytics

#### Q3 2024
- 🔄 Real-time market integration
- 🔄 Automated pricing updates
- 🔄 Multi-tenant support

#### Q4 2024
- 📅 AI model optimization
- 📅 Predictive analytics
- 📅 API marketplace

---

## 🙏 Acknowledgments

- **FastAPI** team for the excellent framework
- **React** community for the incredible ecosystem
- **Docker** for making deployment simple
- **PostgreSQL** for robust data storage
- **Prometheus/Grafana** for monitoring stack
- All open-source contributors who made this possible

---

## 📌 Quick Links

- [Documentation](https://docs.company.com)
- [API Reference](https://api.company.com/docs)
- [Status Page](https://status.company.com)
- [Changelog](CHANGELOG.md)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

---

<div align="center">

**[⬆ Back to Top](#-smartappraisal---internal-appraisal-pricing-system)**

Made with ❤️ by the SmartAppraisal Team

© 2024 SmartAppraisal. All rights reserved.

</div>
```
