const tasks = document.querySelectorAll(".task");
const columns = document.querySelectorAll(".column");
let dragged = null;

// Drag events
tasks.forEach(task => {
  task.addEventListener("dragstart", () => {
    dragged = task;
    setTimeout(() => task.style.display = "none", 0);
  });

  task.addEventListener("dragend", () => {
    task.style.display = "block";
    dragged.classList.add("flip");

    setTimeout(() => dragged.classList.remove("flip"), 500);
  });
});

// Drop events
columns.forEach(column => {
  column.addEventListener("dragover", e => e.preventDefault());

  column.addEventListener("drop", () => {
    column.appendChild(dragged);
  });
});

// Shuffle array
document.getElementById("shuffleBtn").addEventListener("click", () => {
  const allTasks = Array.from(document.querySelectorAll(".task"));
  const todo = document.getElementById("todo");

  shuffleArray(allTasks);

  allTasks.forEach(task => todo.appendChild(task));
});

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}