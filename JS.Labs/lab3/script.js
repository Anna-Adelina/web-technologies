function task1() {
    let i = 1;
    let sum = 0;

    while (i <= 50) {
        sum += i;
        i++;
    }

    console.log("Завдання 1: Сума перших 50 натуральних чисел =", sum);
}


function task2() {
    let number = prompt("Введіть число для обчислення факторіалу:");
    let factorial = 1;

    for (let i = 1; i <= number; i++) {
        factorial *= i;
    }

    console.log("Завдання 2: Факторіал числа", number, "=", factorial);
}


function task3() {
    let month = parseInt(prompt("Введіть номер місяця (1-12):"));
    let name;

    switch (month) {
        case 1: name = "Січень"; break;
        case 2: name = "Лютий"; break;
        case 3: name = "Березень"; break;
        case 4: name = "Квітень"; break;
        case 5: name = "Травень"; break;
        case 6: name = "Червень"; break;
        case 7: name = "Липень"; break;
        case 8: name = "Серпень"; break;
        case 9: name = "Вересень"; break;
        case 10: name = "Жовтень"; break;
        case 11: name = "Листопад"; break;
        case 12: name = "Грудень"; break;
        default: name = "Невірний номер місяця";
    }

    console.log("Завдання 3:", name);
}


function task4(arr) {
    let sum = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] % 2 === 0) {
            sum += arr[i];
        }
    }

    console.log("Завдання 4: Сума парних чисел =", sum);
    return sum;
}


const task5 = (str) => {
    let vowels = "aeiouAEIOUаеєиіїоуюяАЕЄИІЇОУЮЯ";
    let count = 0;

    for (let char of str) {
        if (vowels.includes(char)) {
            count++;
        }
    }

    console.log("Завдання 5: Кількість голосних =", count);
    return count;
};


function task6(base, exponent) {
    let result = 1;

    for (let i = 0; i < exponent; i++) {
        result *= base;
    }

    console.log("Завдання 6:", base, "^", exponent, "=", result);
    return result;
}


task1();
task2();
task3();
task4([1, 2, 3, 4, 5, 6, 7, 8]);
task5("Hello World");
task6(2, 5); 