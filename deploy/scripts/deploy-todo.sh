#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/todo-cicd

cd "$APP_DIR"
test -f .env

/usr/bin/npm ci --omit=dev
/usr/bin/npm run check
DATABASE_URL="$(/usr/bin/sed -n 's/^DATABASE_URL=//p' .env | /usr/bin/tail -n 1)"
test -n "$DATABASE_URL"
/usr/bin/psql "$DATABASE_URL" -f database/init.sql
/bin/chown -R deployer:todoapp "$APP_DIR"
/usr/bin/find "$APP_DIR" -type d -exec /bin/chmod 750 {} \;
/usr/bin/find "$APP_DIR" -type f -exec /bin/chmod 640 {} \;
/bin/chown todoapp:todoapp "$APP_DIR/.env"
/bin/chmod 600 "$APP_DIR/.env"
/bin/systemctl restart todo-cicd
/bin/systemctl is-active --quiet todo-cicd
