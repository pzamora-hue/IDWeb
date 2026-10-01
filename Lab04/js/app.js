let tareas = [];
let filtroActual = 'todas';

const todoForm = document.getElementById('todo-form');
const tituloInput = document.getElementById('titulo-input');
const cursoInput = document.getElementById('curso-input');
const fechaInput = document.getElementById('fecha-input');
const alertContainer = document.getElementById('alert-container');
const todoList = document.getElementById('todo-list');
const filterButtons = document.getElementById('filter-buttons');

document.addEventListener('DOMContentLoaded', () => {
    cargarLocalStorage();
    renderizarTareas();
});

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const titulo = tituloInput.value.trim();
    const curso = cursoInput.value.trim();
    const fechaEntrega = fechaInput.value;

    if (!titulo || !curso || !fechaEntrega) {
        mostrarAlerta('Por favor, complete todos los campos del formulario.');
        return;
    }

    const [year, month, day] = fechaEntrega.split('-');
    const fechaSeleccionada = new Date(year, month - 1, day);
    
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaHoy) {
        mostrarAlerta('La fecha de entrega no puede ser anterior a la fecha actual.');
        return;
    }

    const nuevaTarea = {
        id: Date.now(),
        titulo: titulo,
        curso: curso,
        fechaEntrega: fechaEntrega,
        completada: false
    };

    tareas.push(nuevaTarea);
    guardarLocalStorage();
    renderizarTareas();
    
    todoForm.reset();
    alertContainer.innerHTML = '';
});

function mostrarAlerta(mensaje) {
    alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show mb-3" role="alert">
            ${mensaje}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" onclick="this.parentElement.remove()"></button>
        </div>
    `;
}

todoList.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    
    const id = Number(li.dataset.id);

    if (e.target.classList.contains('btn-toggle')) {
        const tarea = tareas.find(t => t.id === id);
        if (tarea) {
            tarea.completada = !tarea.completada;
            guardarLocalStorage();
            renderizarTareas();
        }
    }

    if (e.target.classList.contains('btn-delete')) {
        tareas = tareas.filter(t => t.id !== id);
        guardarLocalStorage();
        renderizarTareas();
    }
});

filterButtons.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const buttons = filterButtons.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        e.target.classList.add('active');
        filtroActual = e.target.dataset.filter;
        renderizarTareas();
    }
});

function renderizarTareas() {
    todoList.innerHTML = '';

    let tareasFiltradas = tareas.filter(tarea => {
        if (filtroActual === 'pendientes') return !tarea.completada;
        if (filtroActual === 'completadas') return tarea.completada;
        return true;
    });

    if (tareasFiltradas.length === 0) {
        todoList.innerHTML = '<li class="list-group-item text-center text-muted">No hay tareas registradas.</li>';
        return;
    }

    const htmlTareas = tareasFiltradas.map(tarea => {
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center task-item" data-id="${tarea.id}">
                <div>
                    <h6 class="mb-0 ${tarea.completada ? 'completed-task' : ''}">${tarea.titulo}</h6>
                    <small class="text-muted">Curso: ${tarea.curso} | Entrega: ${tarea.fechaEntrega}</small>
                </div>
                <div>
                    <button class="btn btn-sm ${tarea.completada ? 'btn-secondary' : 'btn-success'} btn-toggle me-1">
                        ${tarea.completada ? 'Desmarcar' : 'Completar'}
                    </button>
                    <button class="btn btn-sm btn-danger btn-delete">Eliminar</button>
                </div>
            </li>
        `;
    }).join('');

    todoList.innerHTML = htmlTareas;
}

function guardarLocalStorage() {
    localStorage.setItem('tareas_db', JSON.stringify(tareas));
}

function cargarLocalStorage() {
    const datos = localStorage.getItem('tareas_db');
    if (datos) {
        tareas = JSON.parse(datos);
    }
}