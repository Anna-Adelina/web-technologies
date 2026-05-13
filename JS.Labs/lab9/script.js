// Перемикання табів
function openTab(tabName) {
    document.querySelectorAll('.form-content').forEach(form => form.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    if (tabName === 'signup') {
        document.getElementById('signup-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('login-form').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

// Показ/приховання пароля
document.querySelectorAll('.toggle-password').forEach(icon => {
    icon.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            this.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = "password";
            this.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
});

// Динамічні міста
const cities = {
  ua: ['Kyiv', 'Kharkiv', 'Lviv', 'Odesa', 'Dnipro', 'Zaporizhzhia', 'Chernivtsi', 'Vinnytsia', 'Poltava', 'Mykolaiv'],
  de: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig'],
  fr: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux', 'Strasbourg', 'Nantes'],
  us: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
  pl: ['Warsaw', 'Kraków', 'Łódź', 'Wrocław', 'Poznań', 'Gdańsk', 'Szczecin', 'Lublin'],
  gb: ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Liverpool', 'Bristol', 'Edinburgh'],
  ca: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Winnipeg', 'Quebec City'],
  it: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence'],
  es: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Bilbao'],
  nl: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Tilburg'],
};

document.getElementById('reg-country').addEventListener('change', function() {
    const citySelect = document.getElementById('reg-city');
    citySelect.innerHTML = '<option value="">Choose city...</option>';
    
    if (this.value) {
        citySelect.disabled = false;
        cities[this.value].forEach(city => {
            let opt = document.createElement('option');
            opt.value = city.toLowerCase();
            opt.textContent = city;
            citySelect.appendChild(opt);
        });
    } else {
        citySelect.disabled = true;
    }
});

// Функція валідації
function setStatus(element, isValid, message = "") {
    const errorSpan = element.closest('.input-group').querySelector('.error-msg');
    if (isValid) {
        element.classList.add('valid');
        element.classList.remove('invalid');
        errorSpan.textContent = "Looks good!";
        errorSpan.style.color = "#28a745";
    } else {
        element.classList.add('invalid');
        element.classList.remove('valid');
        errorSpan.textContent = message;
        errorSpan.style.color = "#dc3545";
    }
    return isValid;
}

// Валідація реєстрації
document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let isFormValid = true;

    // First & Last Name
    const fname = document.getElementById('reg-firstname');
    isFormValid &= setStatus(fname, fname.value.length >= 3 && fname.value.length <= 15, "Must be 3-15 chars");

    const lname = document.getElementById('reg-lastname');
    isFormValid &= setStatus(lname, lname.value.length >= 3 && lname.value.length <= 15, "Must be 3-15 chars");

    // Email
    const email = document.getElementById('reg-email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    isFormValid &= setStatus(email, emailRegex.test(email.value), "Invalid email format");

    // Phone
    const phone = document.getElementById('reg-phone');
    const phoneRegex = /^\+380\d{9}$/;
    isFormValid &= setStatus(phone, phoneRegex.test(phone.value), "Use +380XXXXXXXXX");

    // Password
    const pass = document.getElementById('reg-password');
    isFormValid &= setStatus(pass, pass.value.length >= 6, "Min 6 characters");

    // Confirm Password
    const confirm = document.getElementById('reg-confirm');
    isFormValid &= setStatus(confirm, confirm.value === pass.value && confirm.value !== "", "Passwords don't match");

    // Date of Birth
    const dobInput = document.getElementById('reg-dob');
    if (!dobInput.value) {
        isFormValid &= setStatus(dobInput, false, "Required field");
    } else {
        const birthDate = new Date(dobInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

        if (birthDate > today) {
            isFormValid &= setStatus(dobInput, false, "Cannot be in future");
        } else if (age < 12) {
            isFormValid &= setStatus(dobInput, false, "Must be at least 12 years old");
        } else {
            isFormValid &= setStatus(dobInput, true);
        }
    }

    // Sex (radio)
    const sexChecked = document.querySelector('input[name="reg-sex"]:checked');
    const sexGroup = document.getElementById('reg-sex');
    const sexError = sexGroup.nextElementSibling;
    if (sexChecked) {
        sexGroup.classList.remove('invalid');
        sexError.textContent = 'Looks good!';
        sexError.style.color = '#28a745';
    } else {
        sexGroup.classList.add('invalid');
        sexError.textContent = 'Please select an option';
        sexError.style.color = '#dc3545';
        isFormValid = false;
    }

    // Country & City
    ['reg-country', 'reg-city'].forEach(id => {
        const el = document.getElementById(id);
        isFormValid &= setStatus(el, el.value !== "", "Please select an option");
    });

    if (isFormValid) {
        alert("Ви успішно зареєстровані!");
        this.reset();

        document.getElementById('reg-sex').classList.remove('invalid'); 
        document.querySelectorAll('.valid, .invalid')
            .forEach(el => el.classList.remove('valid', 'invalid'));
        document.querySelectorAll('.error-msg')
            .forEach(el => el.textContent = "");
        document.getElementById('reg-city').disabled = true;
    }
    
});

// Валідація логіну
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    let isFormValid = true;

    const user = document.getElementById('login-user');
    isFormValid &= setStatus(user, user.value.trim() !== "", "Username is required");

    const pass = document.getElementById('login-pass');
    isFormValid &= setStatus(pass, pass.value.length >= 6, "Min 6 characters");

    if (isFormValid) {
        alert("Вхід виконано!");
        this.reset();

        document.querySelectorAll('#login-form .valid, #login-form .invalid')
            .forEach(el => el.classList.remove('valid', 'invalid'));
        document.querySelectorAll('#login-form .error-msg')
            .forEach(el => el.textContent = '');
    }
});