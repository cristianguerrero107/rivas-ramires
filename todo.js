// Variables globales
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalTasksSpan = document.getElementById('totalTasks');
const completedTasksSpan = document.getElementById('completedTasks');

let tasks = [];
let currentFilter = 'all';

const STORAGE_KEY = 'todoTasks';

// Cargar tareas al iniciar
document.addEventListener('DOMContentLoaded', () => {
	loadTasks();
	renderTasks();
	updateStats();
});

// Event Listeners
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		addTask();
	}
});

filterBtns.forEach(btn => {
	btn.addEventListener('click', (e) => {
		filterBtns.forEach(b => b.classList.remove('active'));
		e.target.classList.add('active');
		currentFilter = e.target.getAttribute('data-filter');
		renderTasks();
	});
});

clearBtn.addEventListener('click', clearCompletedTasks);

// Función para añadir tarea
function addTask() {
	const taskText = taskInput.value.trim();

	if (taskText === '') {
		alert('Por favor, escribe una tarea');
		return;
	}

	const newTask = {
		id: Date.now(),
		text: taskText,
		completed: false,
		createdAt: new Date().toLocaleDateString('es-ES')
	};

	tasks.push(newTask);
	saveTasks();
	renderTasks();
	updateStats();
	taskInput.value = '';
	taskInput.focus();
}

// Función para eliminar tarea
function deleteTask(id) {
	tasks = tasks.filter(task => task.id !== id);
	saveTasks();
	renderTasks();
	updateStats();
}

// Función para marcar/desmarcar tarea como completada
function toggleTask(id) {
	const task = tasks.find(task => task.id === id);
	if (task) {
		task.completed = !task.completed;
		saveTasks();
		renderTasks();
		updateStats();
	}
}

// Función para renderizar tareas
function renderTasks() {
	taskList.innerHTML = '';

	let filteredTasks = tasks;

	if (currentFilter === 'active') {
		filteredTasks = tasks.filter(task => !task.completed);
	} else if (currentFilter === 'completed') {
		filteredTasks = tasks.filter(task => task.completed);
	}

	if (filteredTasks.length === 0) {
		taskList.innerHTML = `
			<div class="empty-state">
				<div class="empty-state-icon">📝</div>
				<div class="empty-state-text">
					${currentFilter === 'all' ? 'No hay tareas aún' : 
					  currentFilter === 'active' ? 'No hay tareas activas' : 
					  'No hay tareas completadas'}
				</div>
			</div>
		`;
		return;
	}

	filteredTasks.forEach(task => {
		const li = document.createElement('li');
		li.className = `task-item ${task.completed ? 'completed' : ''}`;
		
		li.innerHTML = `
			<input 
				type="checkbox" 
				class="checkbox" 
				${task.completed ? 'checked' : ''}
				onchange="toggleTask(${task.id})"
			>
			<span class="task-text">${escapeHtml(task.text)}</span>
			<button class="delete-btn" onclick="deleteTask(${task.id})">Eliminar</button>
		`;
		
		taskList.appendChild(li);
	});
}

// Función para actualizar estadísticas
function updateStats() {
	const total = tasks.length;
	const completed = tasks.filter(task => task.completed).length;

	totalTasksSpan.textContent = total;
	completedTasksSpan.textContent = completed;
}

// Función para limpiar tareas completadas
function clearCompletedTasks() {
	if (tasks.filter(task => task.completed).length === 0) {
		alert('No hay tareas completadas para limpiar');
		return;
	}

	if (confirm('¿Seguro que quieres eliminar todas las tareas completadas?')) {
		tasks = tasks.filter(task => !task.completed);
		saveTasks();
		renderTasks();
		updateStats();
	}
}

// Función para guardar en Local Storage
function saveTasks() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Función para cargar desde Local Storage
function loadTasks() {
	const storedTasks = localStorage.getItem(STORAGE_KEY);
	if (storedTasks) {
		tasks = JSON.parse(storedTasks);
	}
}

// Función para escapar HTML y evitar XSS
function escapeHtml(text) {
	const map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g, m => map[m]);
}
