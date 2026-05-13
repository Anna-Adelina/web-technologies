const button = document.getElementById("toggleEdit");
const grid = document.getElementById("grid");

let editMode = false;
let dragged = null;

// toggle edit mode
button.addEventListener("click", () => {
  editMode = !editMode;

  if (editMode) {
    grid.classList.add("edit-mode");
    button.textContent = "Готово";
  } else {
    grid.classList.remove("edit-mode");
    button.textContent = "Редагувати";
  }

  updateDraggable();
});

// enable/disable drag
function updateDraggable() {
  document.querySelectorAll(".card").forEach(card => {
    card.draggable = editMode;
  });
}

// drag events
grid.addEventListener("dragstart", e => {
  if (!editMode) return;
  dragged = e.target;
  e.target.classList.add("dragging");
});

grid.addEventListener("dragend", e => {
  e.target.classList.remove("dragging");
});

grid.addEventListener("dragover", e => {
  e.preventDefault();
  const afterElement = getDragAfterElement(grid, e.clientY);
  if (afterElement == null) {
    grid.appendChild(dragged);
  } else {
    grid.insertBefore(dragged, afterElement);
  }
});

function getDragAfterElement(container, y) {
  const elements = [...container.querySelectorAll(".card:not(.dragging)")];

  return elements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// delete cards
grid.addEventListener("click", e => {
  if (e.target.classList.contains("delete") && editMode) {
    e.target.parentElement.remove();
  }
});