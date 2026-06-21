#!/bin/bash
# scripts/restore.sh - Database restore script

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f ${BACKUP_FILE} ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

echo "Starting database restore from: ${BACKUP_FILE}"

# Stop application
docker-compose -f docker-compose.prod.yml down

# Restore database
gunzip -c ${BACKUP_FILE} | docker-compose -f docker-compose.prod.yml exec -T postgres \
    psql -U ${DB_USER} -d ${DB_NAME}

# Start application
docker-compose -f docker-compose.prod.yml up -d

echo "Restore completed successfully!"
