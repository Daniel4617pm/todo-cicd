# To-Do List CI/CD

SPA para gestionar tareas, con API Express y PostgreSQL. Incluye crear, listar, editar, completar, eliminar y filtro en tiempo real.

## Ejecución local

1. Instala Node.js 20+ y PostgreSQL 16+.
2. Crea una base de datos y un usuario, por ejemplo: `createdb todo_db`.
3. Ejecuta el esquema: `psql -d todo_db -f database/init.sql`.
4. Copia `.env.example` como `.env` y ajusta `DATABASE_URL`.
5. Instala y ejecuta: `npm install` y `npm run dev`.

La aplicación quedará disponible en `http://localhost:3000`.
