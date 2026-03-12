let tasks = [];
let filter = "all";

const taskNameInput = document.getElementById("taskName");
const prioritySelect = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const message = document.getElementById("message");
const filterButtons = document.querySelectorAll(".filterBtn");

function showMessage(text) {
  message.textContent = text;
  if (!text) return;
  setTimeout(() => {
    message.textContent = "";
  }, 2000);
}

function addTask() {
  const name = taskNameInput.value.trim();
  const priority = prioritySelect.value;

  if (name === "") {
    showMessage("Please type a task name.");
    return;
  }

  const newTask = {
    id: Date.now(),
    name,
    priority,
    completed: false,
  };

  tasks.push(newTask);
  taskNameInput.value = "";
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  renderTasks();
}

function toggleTask(id) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  renderTasks();
}

function getVisibleTasks() {
  if (filter === "completed") {
    return tasks.filter((t) => t.completed);
  }
  if (filter === "pending") {
    return tasks.filter((t) => !t.completed);
  }
  return tasks;
}

function renderTasks() {
  taskList.innerHTML = "";

  const visible = getVisibleTasks();

  if (visible.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks to show.";
    taskList.appendChild(li);
    return;
  }

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "taskItem";

    const left = document.createElement("div");
    left.className = "taskLeft";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("div");
    text.className = "taskText" + (task.completed ? " done" : "");
    text.textContent = task.name;

    const priority = document.createElement("span");
    priority.className = "priorityTag";
    priority.textContent = task.priority;

    left.appendChild(checkbox);
    left.appendChild(text);
    left.appendChild(priority);

    const del = document.createElement("button");
    del.className = "deleteBtn";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(left);
    li.appendChild(del);

    taskList.appendChild(li);
  });
}

function setFilter(newFilter) {
  filter = newFilter;

  filterButtons.forEach((btn) => {
    const isActive = btn.getAttribute("data-filter") === filter;
    if (isActive) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  renderTasks();
}

addTaskBtn.addEventListener("click", addTask);
taskNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => setFilter(btn.getAttribute("data-filter")));
});

setFilter("all");
