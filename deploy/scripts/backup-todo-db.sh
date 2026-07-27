#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=/var/backups/todo-cicd
DATE=$(/usr/bin/date +%F_%H%M%S)
/usr/bin/install -d -m 700 "$BACKUP_DIR"
/bin/chown postgres:postgres "$BACKUP_DIR"
/usr/sbin/runuser -u postgres -- /usr/bin/pg_dump -Fc -d todo_db -f "$BACKUP_DIR/todo_db_$DATE.dump"
/usr/bin/find "$BACKUP_DIR" -type f -name 'todo_db_*.dump' -mtime +14 -delete
