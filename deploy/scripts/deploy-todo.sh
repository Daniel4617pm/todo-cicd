#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/var/www/todo-cicd

cd "$APP_DIR"
test -f .env

/usr/bin/npm ci --omit=dev
/usr/bin/npm run check
/bin/chown -R todoapp:todoapp "$APP_DIR"
/bin/systemctl restart todo-cicd
/bin/systemctl is-active --quiet todo-cicd
