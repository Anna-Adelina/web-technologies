function task1() {
    console.log("Завдання 1");
    let fruits = ["яблуко", "банан", "груша", "слива"];

    fruits.pop();
    console.log("Після видалення:", fruits);

    fruits.unshift("ананас");
    console.log("Після додавання:", fruits);

    fruits.sort().reverse();
    console.log("Після сортування:", fruits);

    let index = fruits.indexOf("яблуко");
    console.log("Індекс яблука:", index);
}


function task2() {
    console.log("\nЗавдання 2");
    let colors = ["червоний", "синій", "зелений", "світло-синій", "жовтий"];

    let longest = colors.reduce((a, b) => a.length > b.length ? a : b);
    let shortest = colors.reduce((a, b) => a.length < b.length ? a : b);

    console.log("Найдовший елемент:", longest);
    console.log("Найкоротший елемент:", shortest);

    let filtered = colors.filter(c => c.includes("синій"));
    console.log("Тільки сині:", filtered);

    let result = colors.join(", ");
    console.log("Перетворення у рядок:", result);
}


function task3() {
    console.log("\nЗавдання 3")
    let employees = [
        { name: "Степан", age: 30, position: "розробник" },
        { name: "Марія", age: 25, position: "дизайнерка" },
        { name: "Олег", age: 35, position: "розробник" }
    ];

    employees.sort((a, b) => a.name.localeCompare(b.name));
    console.log("Відсортовано за алфавітом:", employees);

    let devs = employees.filter(e => e.position === "розробник");
    console.log("Тільки розробники:", devs);

    employees = employees.filter(e => e.age !== 35);
    console.log("Після видалення:", [...employees]);

    employees.push({ name: "Анна", age: 28, position: "тестувальниця" });
    console.log("Після додавання:", employees);
}


function task4() {
    console.log("\nЗавдання 4")
    let students = [
        { name: "Олексій", age: 21, course: 2 },
        { name: "Ірина", age: 19, course: 3 },
        { name: "Петро", age: 22, course: 4 }
    ];

    students = students.filter(s => s.name !== "Олексій");

    students.push({ name: "Наталя", age: 20, course: 3 });

    students.sort((a, b) => b.age - a.age);

    let thirdCourse = students.find(s => s.course === 3);

    console.log("Кінцевий масив:", students);
    console.log("Студент/ка 3 курсу:", thirdCourse);
}

function task5() {
    console.log("\nЗавдання 5")
    let numbers = [1, 2, 3, 4, 5];

    let squares = numbers.map(n => n * n);
    console.log("Піднесення до квадрату:", squares);

    let even = numbers.filter(n => n % 2 === 0);
    console.log("Лише парні:", even);

    let sum = numbers.reduce((a, b) => a + b, 0);
    console.log("Сума:", sum);

    let newNumbers = [6, 7, 8, 9, 10];
    numbers = numbers.concat(newNumbers);
    console.log("Додано новий масив:", numbers);

    numbers.splice(0, 3);
    console.log("Після видалення:", numbers);
}


function libraryManagement() {
    console.log("\nЗавдання 6")
    let books = [
        { title: "Посібник з убивтсва для хорошої дівчинки", author: "Голлі Джексон", genre: "детектив", pages: 200, isAvailable: true },
        { title: "Служниця", author: "Фріда Мак-Фадден", genre: "психологічний трилер", pages: 300, isAvailable: true }
    ];

    function addBook(title, author, genre, pages) {
        books.push({ title, author, genre, pages, isAvailable: true });
    }

    function removeBook(title) {
        books = books.filter(b => b.title !== title);
    }

    function findBooksByAuthor(author) {
        return books.filter(b => b.author === author);
    }

    function toggleBookAvailability(title, isBorrowed) {
        books.forEach(b => {
            if (b.title === title) {
                b.isAvailable = !isBorrowed;
            }
        });
    }

    function sortBooksByPages() {
        books.sort((a, b) => a.pages - b.pages);
    }

    function getBooksStatistics() {
        let total = books.length;
        let available = books.filter(b => b.isAvailable).length;
        let borrowed = total - available;
        let avgPages = books.reduce((sum, b) => sum + b.pages, 0) / total;

        return { total, available, borrowed, avgPages };
    }

    addBook("Буремний перевал", "Емілі Бронте", "роман", 400);
    removeBook("Служниця");
    toggleBookAvailability("Посібник з убивтсва для хорошої дівчинки", true);
    sortBooksByPages();

    console.log("Всі книги:", books);
    console.log("Пошук:", findBooksByAuthor("Голлі Джексон"));
    console.log("Статистика:", getBooksStatistics());
}

function task7() {
    console.log("\nЗавдання 7")
    let student = {
        name: "Андрій",
        age: 20,
        course: 2
    };

    student.subjects = ["Математика", "Програмування"];

    delete student.age;

    console.log("Інформація:", student);
}

task1();
task2();
task3();
task4();
task5();
libraryManagement();
task7();