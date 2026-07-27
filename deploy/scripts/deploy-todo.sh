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
/bin/chown -R todoapp:todoapp "$APP_DIR"
/bin/systemctl restart todo-cicd
/bin/systemctl is-active --quiet todo-cicd
