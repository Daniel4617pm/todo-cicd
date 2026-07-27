# Configuración del VPS (Ubuntu 24.04)

Los archivos de esta carpeta son plantillas para el servidor de producción. Sustituye `todo.example.com` por tu dominio o IP antes de copiar la configuración de Nginx.

## 1. Paquetes, usuario y directorio

Ejecuta como un usuario con `sudo`:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql postgresql-contrib nodejs npm rsync ufw
sudo adduser --system --group --home /var/www/todo-cicd todoapp
sudo mkdir -p /var/www/todo-cicd
sudo chown -R todoapp:todoapp /var/www/todo-cicd
```

Instala Node.js 20 LTS desde el repositorio oficial de NodeSource si tu distribución no ofrece esa versión.

## 2. Base de datos

```bash
sudo -u postgres psql
CREATE USER todo_user WITH PASSWORD 'CAMBIA_POR_UNA_CLAVE_LARGA';
CREATE DATABASE todo_db OWNER todo_user;
\q
psql -U todo_user -h 127.0.0.1 -d todo_db -f /var/www/todo-cicd/database/init.sql
```

Crea `/var/www/todo-cicd/.env` y evita subirlo a Git:

```env
PORT=3000
DATABASE_URL=postgresql://todo_user:CAMBIA_POR_UNA_CLAVE_LARGA@127.0.0.1:5432/todo_db
```

```bash
sudo chown todoapp:todoapp /var/www/todo-cicd/.env
sudo chmod 600 /var/www/todo-cicd/.env
```

## 3. Servicios web y aplicación

```bash
sudo cp deploy/systemd/todo-cicd.service /etc/systemd/system/
sudo cp deploy/nginx/todo-cicd.conf /etc/nginx/sites-available/todo-cicd
sudo ln -s /etc/nginx/sites-available/todo-cicd /etc/nginx/sites-enabled/todo-cicd
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl daemon-reload
sudo systemctl enable --now todo-cicd nginx
```

## 4. Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

PostgreSQL se mantiene en `127.0.0.1`; el puerto 5432 no se expone al exterior.

## 5. Usuario de despliegue y GitHub Actions

```bash
sudo adduser deployer
sudo usermod -aG todoapp deployer
sudo install -m 755 deploy/scripts/deploy-todo.sh /usr/local/bin/deploy-todo.sh
echo 'deployer ALL=(root) NOPASSWD: /usr/local/bin/deploy-todo.sh' | sudo tee /etc/sudoers.d/todo-deployer
sudo chmod 440 /etc/sudoers.d/todo-deployer
```

Guarda la clave pública SSH del usuario `deployer` en `/home/deployer/.ssh/authorized_keys`. En GitHub, crea estos secretos del repositorio:

| Secreto | Valor |
| --- | --- |
| `SSH_PRIVATE_KEY` | Clave privada Ed25519 del usuario `deployer` |
| `SERVER_HOST` | IP o dominio del VPS |
| `SERVER_USER` | `deployer` |
| `DEPLOY_PATH` | `/var/www/todo-cicd` |

Para respaldos diarios:

```bash
sudo install -m 700 deploy/scripts/backup-todo-db.sh /usr/local/bin/backup-todo-db.sh
sudo crontab -e
# Agrega: 0 2 * * * /usr/local/bin/backup-todo-db.sh
```
