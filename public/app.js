const form = document.querySelector('#task-form');
const titleInput = document.querySelector('#new-task');
const filterInput = document.querySelector('#filter');
const list = document.querySelector('#task-list');
const template = document.querySelector('#task-template');
const message = document.querySelector('#message');
const emptyState = document.querySelector('#empty-state');
const taskCount = document.querySelector('#task-count');
let tasks = [];

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'No fue posible completar la operación.');
  }
  return response.status === 204 ? null : response.json();
}

function showMessage(text) {
  message.textContent = text;
  message.hidden = !text;
}

function filteredTasks() {
  const term = filterInput.value.trim().toLocaleLowerCase();
  return tasks.filter((task) => task.title.toLocaleLowerCase().includes(term));
}

function render() {
  const visible = filteredTasks();
  list.replaceChildren();
  taskCount.textContent = `${visible.length} ${visible.length === 1 ? 'tarea' : 'tareas'}`;
  emptyState.hidden = visible.length !== 0;

  visible.forEach((task) => {
    const item = template.content.firstElementChild.cloneNode(true);
    const toggle = item.querySelector('.toggle');
    const title = item.querySelector('.task-title');
    toggle.checked = task.completed;
    item.classList.toggle('completed', task.completed);
    title.textContent = task.title;
    toggle.addEventListener('change', () => updateTask(task.id, { ...task, completed: toggle.checked }));
    item.querySelector('.edit').addEventListener('click', () => editTask(task));
    item.querySelector('.delete').addEventListener('click', () => deleteTask(task.id));
    list.append(item);
  });
}

async function loadTasks() {
  try {
    tasks = await request('/api/tasks');
    render();
  } catch (error) {
    showMessage(error.message);
  }
}

async function updateTask(id, payload) {
  try {
    const updated = await request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    tasks = tasks.map((task) => task.id === id ? updated : task);
    showMessage('');
    render();
  } catch (error) {
    showMessage(error.message);
    render();
  }
}

async function editTask(task) {
  const title = window.prompt('Editar tarea:', task.title);
  if (title === null) return;
  await updateTask(task.id, { ...task, title: title.trim() });
}

async function deleteTask(id) {
  if (!window.confirm('¿Eliminar esta tarea?')) return;
  try {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
    tasks = tasks.filter((task) => task.id !== id);
    showMessage('');
    render();
  } catch (error) {
    showMessage(error.message);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  try {
    const task = await request('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
    tasks.unshift(task);
    titleInput.value = '';
    showMessage('');
    render();
  } catch (error) {
    showMessage(error.message);
  }
});

filterInput.addEventListener('input', render);
loadTasks();
