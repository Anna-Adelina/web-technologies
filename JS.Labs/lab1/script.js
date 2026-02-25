const textElement = document.querySelector('#message');

textElement.textContent = "Hello world!";

const btn = document.querySelector('#actionButton');

btn.ondblclick = function() {
    alert("Ім'я студентки: Бурковська Аделіна");
};