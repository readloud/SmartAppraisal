#!/bin/bash
# scripts/backup.sh - Database backup script

set -e

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/appraisal_${DATE}.sql"

echo "Starting database backup..."

# Create backup
docker-compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_FILE}

# Compress backup
gzip ${BACKUP_FILE}

# Keep only last 7 days of backups
find ${BACKUP_DIR} -name "appraisal_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
echo "Backup size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
