//pure functions
const createTodo = (text) => ({
    id: Date.now(),
    text,
    completed: false,
    dateCreated: Date.now(),
    dateUpdated: Date.now()
});

const toggleTodo = (todos, id) => todos.map(todo => 
    todo.id === id 
        ? { ...todo, completed: !todo.completed, dateUpdated: Date.now() } 
        : todo
);

const deleteTodo = (todos, id) => todos.filter(todo => todo.id !== id);

const updateTodoText = (todos, id, newText) => todos.map(todo =>
    todo.id === id 
        ? { ...todo, text: newText, dateUpdated: Date.now() } 
        : todo
);

const sortTodos = (todos, criterion) => {
    const sorted = [...todos];
    switch (criterion) {
        case 'dateCreated': return sorted.sort((a, b) => b.dateCreated - a.dateCreated);
        case 'dateUpdated': return sorted.sort((a, b) => b.dateUpdated - a.dateUpdated);
        case 'status': return sorted.sort((a, b) => a.completed - b.completed);
        default: return sorted;
    }
};

// --- Робота з DOM та станом ---

let state = [];

const render = () => {
    const listElement = document.getElementById('todo-list');
    const sortCriterion = document.getElementById('sort-select').value;
    const sortedTodos = sortTodos(state, sortCriterion);

    listElement.innerHTML = '';

    sortedTodos.forEach(todo => {
        const li = document.createElement('li');
        
        const span = document.createElement('span');
        span.className = `todo-text ${todo.completed ? 'completed' : ''}`;
        span.textContent = todo.text;
        span.contentEditable = false; 

        let clickTimer = null;

        span.onclick = () => {
            if (span.contentEditable === 'true') return;

            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
                return; 
            }

            clickTimer = setTimeout(() => {
                clickTimer = null;
                state = toggleTodo(state, todo.id);
                render();
            }, 220); 
        };

        // Подвійний клік — увімкнути редагування
        span.ondblclick = (e) => {
            e.stopPropagation();
            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
            span.contentEditable = true;
            span.focus();

            const range = document.createRange();
            range.selectNodeContents(span);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        };

        span.onblur = (e) => {
            span.contentEditable = false;
            const newText = e.target.textContent.trim();
            if (newText.length >= 2) {
                state = updateTodoText(state, todo.id, newText);
            } else {
                span.textContent = todo.text; 
            }
            render();
        };

        span.onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                span.blur();
            }
        };

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Видалити';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => {
            state = deleteTodo(state, todo.id);
            render();
        };

        li.append(span, delBtn);
        listElement.appendChild(li);
    });
};


document.getElementById('todo-form').onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    state = [createTodo(input.value), ...state];
    input.value = '';
    render();
};

document.getElementById('sort-select').onchange = render;