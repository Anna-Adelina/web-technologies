let products = [];
let currentFilter = null;
let currentSort = null;

//pure functions
const createProduct = (name, price, category, img) => ({
    id: Date.now().toString(),
    name,
    price: parseFloat(price),
    category,
    img,
    createdAt: new Date(),
    updatedAt: new Date()
});

const calculateTotal = (items) => 
    items.reduce((sum, item) => sum + item.price, 0);

const filterProducts = (items, category) => 
    category ? items.filter(item => item.category === category) : items;

const sortProducts = (items, criteria) => {
    const sorted = [...items];
    if (criteria === 'price') return sorted.sort((a, b) => b.price - a.price);
    if (criteria === 'created') return sorted.sort((a, b) => b.createdAt - a.createdAt);
    if (criteria === 'updated') return sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    return sorted;
};


const render = () => {
    const listElement = document.getElementById('product-list');
    const totalElement = document.getElementById('total-cost');
    
    let displayList = filterProducts(products, currentFilter);
    displayList = sortProducts(displayList, currentSort);

    totalElement.textContent = `Загальна вартість: ${calculateTotal(displayList)} ₴`;

    if (displayList.length === 0) {
        listElement.innerHTML = `<p class="empty-msg">Наразі список товарів пустий. Додайте новий товар.</p>`;
        return;
    }

    listElement.innerHTML = displayList.map(p => `
        <li class="product-card" id="card-${p.id}">
            <img src="${p.img}" alt="${p.name}">
            <small>ID: ${p.id}</small>
            <h3>${p.name}</h3>
            <p>Ціна: <strong>${p.price} ₴</strong></p>
            <p>Категорія: ${p.category}</p>
            <div class="card-actions">
                <button onclick="editProduct('${p.id}')">Редагувати</button>
                <button class="btn-danger" onclick="deleteProduct('${p.id}')">Видалити</button>
            </div>
        </li>
    `).join('');
};

const showToast = (message) => {
    const x = document.getElementById("snackbar");
    x.textContent = message;
    x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
};


const removeProduct = (items, id) => items.filter(p => p.id !== id);
const updateProduct = (items, id, newData) => items.map(p => p.id === id ? {...p, ...newData, updatedAt: new Date()} : p);

const deleteProduct = (id) => {
    const card = document.getElementById(`card-${id}`);
    card.classList.add('removing');
    
    setTimeout(() => {
        products = removeProduct(products, id);
        showToast("Товар успішно видалено!");
        render();
    }, 300);
};

const editProduct = (id) => {
    const p = products.find(item => item.id === id);
    document.getElementById('modal-title').textContent = 'Редагувати товар';
    document.getElementById('edit-id').value = p.id;
    document.getElementById('p-name').value = p.name;
    document.getElementById('p-price').value = p.price;
    document.getElementById('p-category').value = p.category;
    document.getElementById('p-img').value = p.img;
    document.getElementById('modal').style.display = 'flex';
};


document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('p-name').value;
    const price = document.getElementById('p-price').value;
    const category = document.getElementById('p-category').value;
    const img = document.getElementById('p-img').value;

    if (id) {
        products = updateProduct(products, id, {name, price: parseFloat(price), category, img});
        showToast(`Оновлено: ID ${id}, ${name}`);
    } else {
        products = [...products, createProduct(name, price, category, img)];
        showToast("Товар додано успішно!");
    }

    closeModal();
    render();
});

window.applyFilter = (cat) => { currentFilter = cat; render(); };
window.resetFilters = () => { currentFilter = null; render(); };
window.applySort = (type) => { currentSort = type; render(); };
window.resetSort = () => { currentSort = null; render(); };

const closeModal = () => {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('product-form').reset();
    document.getElementById('edit-id').value = '';
};

document.getElementById('open-modal-btn').onclick = () => {
    document.getElementById('modal-title').textContent = 'Додати новий товар';
    document.getElementById('modal').style.display = 'flex';
};
document.getElementById('close-modal-btn').onclick = closeModal;

render();