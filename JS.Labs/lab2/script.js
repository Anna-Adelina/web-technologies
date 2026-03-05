function findMinMax(arr) {
    let min = arr[0];
    let max = arr[0];

    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < min) min = arr[i];
        if (arr[i] > max) max = arr[i];
    }

    return { min, max };
}

let numbers = [4, 12, -3, 7, 0, 25];
let result = findMinMax(numbers);

console.log("Масив:", numbers);
console.log("Мінімальне число:", result.min);
console.log("Максимальне число:", result.max);


function compareObjects(obj1, obj2) {
    return (obj1.name === obj2.name && obj1.age === obj2.age)
        ? "Об'єкти рівні"
        : "Об'єкти різні";
}

let person1 = { name: "Anna", age: 20 };
let person2 = { name: "Anna", age: 20 };

let compareResult = compareObjects(person1, person2);

console.log("Об'єкт 1:", person1);
console.log("Об'єкт 2:", person2);
console.log(compareResult);


function isInRange(number, min, max) {
    return number >= min && number <= max;
}

let num = 25;
let minRange = 10;
let maxRange = 20;

let rangeResult = isInRange(num, minRange, maxRange);

console.log("Число:", num);
console.log("Діапазон:", minRange, "-", maxRange);
console.log("В діапазоні:", rangeResult);

let reversed = !rangeResult;

console.log("Після використання NOT:", reversed);


function getGradeTextTernary(grade) {
    return grade >= 90 ? "Відмінно" :
           grade >= 75 ? "Добре" :
           grade >= 60 ? "Задовільно" :
           "Незадовільно";
}

let studentGrade = 82;
let gradeText = getGradeTextTernary(studentGrade);

console.log("Оцінка:", studentGrade);
console.log("Результат:", gradeText);

function getGradeTextIf(grade) {
    if (grade >= 90) {
        return "Відмінно";
    } else if (grade >= 75) {
        return "Добре";
    } else if (grade >= 60) {
        return "Задовільно";
    } else {
        return "Незадовільно";
    }
}
let studentGradeIf = 74;
let gradeTextIf = getGradeTextIf(studentGradeIf);

console.log("Оцінка:", studentGradeIf);
console.log("Результат:", gradeTextIf);


function getSeasonIf(month) {
    if (month < 1 || month > 12) {
        return "Некоректний номер місяця";
    } else {
        if (month === 12 || month <= 2) {
            return "Зима";
        } else if (month >= 3 && month <= 5) {
            return "Весна";
        } else if (month >= 6 && month <= 8) {
            return "Літо";
        } else {
            return "Осінь";
        }
    }
}
let month = 4;
let season = getSeasonIf(month);

console.log("Місяць:", month);
console.log("Сезон:", season);

function getSeasonTernary(month) {
    return (month < 1 || month > 12) ? "Помилка" :
           (month === 12 || month <= 2) ? "Зима" :
           (month <= 5) ? "Весна" :
           (month <= 8) ? "Літо" : "Осінь";
}
let second_month = 7;
let second_season = getSeasonTernary(second_month);

console.log("Місяць:", second_month);
console.log("Сезон:", second_season);