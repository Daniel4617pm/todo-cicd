require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (_error) {
    res.status(503).json({ status: 'database unavailable' });
  }
});

app.get('/api/tasks', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, completed, created_at, updated_at FROM tasks ORDER BY completed ASC, created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

app.post('/api/tasks', async (req, res, next) => {
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 200) {
    return res.status(400).json({ error: 'El título es obligatorio y debe tener hasta 200 caracteres.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title) VALUES ($1) RETURNING id, title, completed, created_at, updated_at',
      [title]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.put('/api/tasks/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const completed = req.body.completed;
  if (!Number.isInteger(id) || !title || title.length > 200 || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Datos de tarea no válidos.' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING id, title, completed, created_at, updated_at',
      [title, completed, id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Tarea no encontrada.' });
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/tasks/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Identificador no válido.' });
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Tarea no encontrada.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Ocurrió un error interno.' });
});

app.listen(port, () => console.log(`To-Do List disponible en http://localhost:${port}`));
