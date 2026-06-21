#!/bin/bash
# scripts/monitoring.sh - System monitoring script

set -e

echo "📊 System Monitoring Report"
echo "==========================="
echo ""

# Container status
echo "🐳 Container Status:"
docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Resource usage
echo "💻 Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" $(docker-compose -f docker-compose.prod.yml ps -q)
echo ""

# Database size
echo "🗄️ Database Size:"
docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U ${DB_USER} -d ${DB_NAME} -c "
    SELECT 
        pg_database_size('${DB_NAME}')/1024/1024 as size_mb,
        pg_database_size('${DB_NAME}')/1024/1024/1024 as size_gb;
    "
echo ""

# Redis info
echo "📦 Redis Info:"
docker-compose -f docker-compose.prod.yml exec -T redis \
    redis-cli -a ${REDIS_PASSWORD} INFO stats | grep -E "total_connections_received|total_commands_processed|keyspace_hits|keyspace_misses"
echo ""

# Recent logs
echo "📝 Recent Errors (last 100 lines):"
docker-compose -f docker-compose.prod.yml logs --tail=100 backend | grep -i error || echo "No recent errors"
echo ""

# Disk usage
echo "💾 Disk Usage:"
df -h / | grep -v "Filesystem"
echo ""

echo "✅ Monitoring report complete!"
