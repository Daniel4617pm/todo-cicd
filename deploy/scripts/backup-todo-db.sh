#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR=/var/backups/todo-cicd
DATE=$(/usr/bin/date +%F_%H%M%S)
/usr/bin/install -d -m 700 "$BACKUP_DIR"
/usr/bin/pg_dump -Fc -U todo_user -d todo_db -f "$BACKUP_DIR/todo_db_$DATE.dump"
/usr/bin/find "$BACKUP_DIR" -type f -name 'todo_db_*.dump' -mtime +14 -delete
