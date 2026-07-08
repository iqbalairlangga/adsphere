#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/home/iqbal/adsphere/database/backups"
DB_NAME="adsphere"
DB_USER="adsphere"

mkdir -p "$BACKUP_DIR"

echo "Backing up database: $DB_NAME"
pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "Created backup: ${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed successfully"
