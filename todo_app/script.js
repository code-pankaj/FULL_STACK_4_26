const STORAGE_KEY = 'todo_app_tasks_v1';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const listEl = document.getElementById('listTask');
const emptyStateEl = document.getElementById('emptyState');
const itemsLeftEl = document.getElementById('itemsLeft');
const itemsTotalEl = document.getElementById('itemsTotal');
const searchInput = document.getElementById('searchInput');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));

const state = {
    tasks: loadTasks(),
    filter: 'all',
    search: ''
};

render();

taskForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask();
});

searchInput?.addEventListener('input', () => {
    state.search = (searchInput.value || '').trim();
    render();
});

clearCompletedBtn?.addEventListener('click', () => {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter((t) => !t.completed);
    persist();
    render();

    const removed = before - state.tasks.length;
    if (removed === 0) return;
});

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        if (!filter) return;
        state.filter = filter;
        render();
    });
});

listEl?.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest('[data-id]');
    const id = Number(item?.getAttribute('data-id'));
    if (!id) return;

    const action = target.getAttribute('data-action');
    if (action === 'toggle') {
        toggleCompleted(id);
        return;
    }

    if (action === 'delete') {
        deleteTask(id);
        return;
    }

    if (action === 'edit') {
        beginEdit(id);
        return;
    }

    if (action === 'save') {
        commitEdit(id);
        return;
    }

    if (action === 'cancel') {
        cancelEdit(id);
        return;
    }
});

listEl?.addEventListener('keydown', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (e.key !== 'Enter') return;
    if (!target.classList.contains('edit-input')) return;

    const item = target.closest('[data-id]');
    const id = Number(item?.getAttribute('data-id'));
    if (!id) return;
    commitEdit(id);
});

function addTask() {
    const text = (taskInput?.value || '').trim();
    if (!text) {
        alert('Please enter a task');
        taskInput?.focus();
        return;
    }

    const newTask = {
        id: Date.now(),
        text,
        completed: false,
        editing: false,
        createdAt: Date.now()
    };

    state.tasks.unshift(newTask);
    if (taskInput) taskInput.value = '';
    persist();
    render();
}

function toggleCompleted(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    persist();
    render();
}

function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    persist();
    render();
}

function beginEdit(id) {
    state.tasks.forEach((t) => {
        t.editing = t.id === id;
    });
    render();

    const input = document.querySelector(`[data-id="${id}"] .edit-input`);
    if (input instanceof HTMLInputElement) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    }
}

function commitEdit(id) {
    const item = document.querySelector(`[data-id="${id}"]`);
    const input = item?.querySelector('.edit-input');
    if (!(input instanceof HTMLInputElement)) return;
    const nextText = input.value.trim();

    if (!nextText) {
        alert('Task cannot be empty');
        input.focus();
        return;
    }

    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.text = nextText;
    task.editing = false;
    persist();
    render();
}

function cancelEdit(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.editing = false;
    render();
}

function getVisibleTasks() {
    const search = state.search.toLowerCase();
    return state.tasks.filter((t) => {
        if (state.filter === 'active' && t.completed) return false;
        if (state.filter === 'completed' && !t.completed) return false;
        if (search && !t.text.toLowerCase().includes(search)) return false;
        return true;
    });
}

function render() {
    // Filters UI
    filterBtns.forEach((btn) => {
        const isActive = btn.getAttribute('data-filter') === state.filter;
        btn.classList.toggle('is-active', isActive);
    });

    const visible = getVisibleTasks();

    if (listEl) {
        listEl.innerHTML = visible
            .map((t) => {
                const completedClass = t.completed ? 'completed' : '';
                if (t.editing) {
                    return `
                        <li class="task ${completedClass}" data-id="${t.id}">
                            <input class="task-check" type="checkbox" data-action="toggle" ${t.completed ? 'checked' : ''} aria-label="Mark complete" />
                            <input class="edit-input" value="${escapeHtml(t.text)}" aria-label="Edit task" />
                            <div class="task-buttons">
                                <button class="icon" type="button" data-action="save" aria-label="Save">Save</button>
                                <button class="icon" type="button" data-action="cancel" aria-label="Cancel">Cancel</button>
                            </div>
                        </li>
                    `;
                }

                return `
                    <li class="task ${completedClass}" data-id="${t.id}">
                        <input class="task-check" type="checkbox" data-action="toggle" ${t.completed ? 'checked' : ''} aria-label="Mark complete" />
                        <p class="task-text">${escapeHtml(t.text)}</p>
                        <div class="task-buttons">
                            <button class="icon" type="button" data-action="edit" aria-label="Edit">Edit</button>
                            <button class="icon danger" type="button" data-action="delete" aria-label="Delete">Delete</button>
                        </div>
                    </li>
                `;
            })
            .join('');
    }

    // Empty state
    const isEmpty = visible.length === 0;
    if (emptyStateEl) {
        emptyStateEl.style.display = isEmpty ? 'block' : 'none';
    }

    // Stats
    const left = state.tasks.filter((t) => !t.completed).length;
    if (itemsLeftEl) itemsLeftEl.textContent = `${left} item${left === 1 ? '' : 's'} left`;
    if (itemsTotalEl) itemsTotalEl.textContent = `${state.tasks.length} total`;
}

function persist() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks.map(stripTaskForStorage)));
    } catch {
        // ignore
    }
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
            .map((t) => ({
                id: Number(t.id),
                text: String(t.text || ''),
                completed: Boolean(t.completed),
                createdAt: Number(t.createdAt || Date.now()),
                editing: false
            }))
            .filter((t) => t.id && t.text);
    } catch {
        return [];
    }
}

function stripTaskForStorage(task) {
    return {
        id: task.id,
        text: task.text,
        completed: task.completed,
        createdAt: task.createdAt
    };
}

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}