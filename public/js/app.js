// Состояние приложения
let currentUser = null;
let selectedProducts = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем данные пользователя
    currentUser = getCurrentUser();
    
    // Рендерим навигацию
    renderNavigation();
    
    // Инициализируем калькулятор
    initCalculator();
    
    // Инициализируем формы аутентификации
    initAuthForms();
    
    // Показываем активную секцию
    if (currentUser) {
        showSection('calculator');
    } else {
        showSection('login');
    }
});

// Функция рендеринга навигации
function renderNavigation() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    nav.innerHTML = `
        <ul>
            <li><a href="#" data-section="calculator">Калькулятор</a></li>
            ${currentUser ? `
                <li><span>Привет, ${currentUser.email}</span></li>
                <li><a href="#" id="logout">Выйти</a></li>
                ${currentUser.role === 'admin' ? `
                    <li><a href="#" data-section="admin">Админ-панель</a></li>
                ` : ''}
            ` : `
                <li><a href="#" data-section="login">Войти</a></li>
                <li><a href="#" data-section="register">Регистрация</a></li>
            `}
        </ul>
    `;
    
    // Добавляем обработчики для навигационных ссылок
    document.querySelectorAll('nav a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Обработчик выхода
    document.getElementById('logout')?.addEventListener('click', logout);
}

// Функция выхода из системы
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    currentUser = null;
    renderNavigation();
    showSection('calculator');
    alert('Вы успешно вышли из системы');
}

// Получение текущего пользователя из localStorage
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

// Переключение между секциями
function showSection(sectionId) {
    // Скрыть все секции
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden-section');
        section.classList.remove('active-section');
    });

    // Показать выбранную секцию
    const activeSection = document.getElementById(`${sectionId}-section`);
    if (activeSection) {
        activeSection.classList.remove('hidden-section');
        activeSection.classList.add('active-section');
    }
}

// Инициализация калькулятора
function initCalculator() {
    const searchInput = document.getElementById('product-search');
    const searchResults = document.getElementById('search-results');
    
    // Поиск продуктов
    searchInput.addEventListener('input', async () => {
        const query = searchInput.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            return;
        }
        
        const products = await searchProducts(query);
        displaySearchResults(products);
    });
}

// Поиск продуктов на сервере
async function searchProducts(query) {
    try {
        const response = await fetch(`/api/products?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Ошибка поиска продуктов');
        return await response.json();
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return [];
    }
}

// Отображение результатов поиска
function displaySearchResults(products) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-result';
        div.textContent = product.name;
        div.dataset.id = product.id;
        
        div.addEventListener('click', () => {
            addProductToCalculator(product);
            document.getElementById('product-search').value = '';
            searchResults.innerHTML = '';
        });
        
        searchResults.appendChild(div);
    });
}

// Добавление продукта в калькулятор
function addProductToCalculator(product) {
    // Проверяем, не добавлен ли уже продукт
    if (selectedProducts.some(p => p.id === product.id)) {
        alert('Этот продукт уже добавлен!');
        return;
    }
    
    const productWithGrams = {
        ...product,
        grams: 100 // Значение по умолчанию
    };
    
    selectedProducts.push(productWithGrams);
    renderSelectedProducts();
}

// Рендер выбранных продуктов
function renderSelectedProducts() {
    const tbody = document.querySelector('#selected-products tbody');
    tbody.innerHTML = '';
    
    let totalCalories = 0;
    let totalProteins = 0;
    let totalFats = 0;
    let totalCarbs = 0;
    let totalGrams = 0;
    
    selectedProducts.forEach((product, index) => {
        const calories = (product.calories * product.grams / 100).toFixed(1);
        const proteins = (product.proteins * product.grams / 100).toFixed(1);
        const fats = (product.fats * product.grams / 100).toFixed(1);
        const carbs = (product.carbs * product.grams / 100).toFixed(1);
        
        totalCalories += parseFloat(calories);
        totalProteins += parseFloat(proteins);
        totalFats += parseFloat(fats);
        totalCarbs += parseFloat(carbs);
        totalGrams += product.grams;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td><input type="number" value="${product.grams}" min="1" class="grams-input" data-index="${index}"></td>
            <td>${calories}</td>
            <td>${proteins}</td>
            <td>${fats}</td>
            <td>${carbs}</td>
            <td><button class="remove-btn" data-index="${index}">Удалить</button></td>
        `;
        tbody.appendChild(row);
    });
    
    // Обновляем итоговые значения
    document.getElementById('total-grams').textContent = totalGrams;
    document.getElementById('total-calories').textContent = totalCalories.toFixed(1);
    document.getElementById('total-proteins').textContent = totalProteins.toFixed(1);
    document.getElementById('total-fats').textContent = totalFats.toFixed(1);
    document.getElementById('total-carbs').textContent = totalCarbs.toFixed(1);
    
    // Добавляем обработчики изменения веса
    document.querySelectorAll('.grams-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const grams = parseInt(e.target.value) || 100;
            selectedProducts[index].grams = grams;
            renderSelectedProducts();
        });
    });
    
    // Добавляем обработчики удаления
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            selectedProducts.splice(index, 1);
            renderSelectedProducts();
        });
    });
}

// Инициализация форм аутентификации
function initAuthForms() {
    // Обработчик формы входа
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;
        const password = e.target.elements[1].value;
        
        const user = await loginUser(email, password);
        if (user) {
            currentUser = user;
            renderNavigation();
            showSection('calculator');
        }
    });
    
    // Обработчик формы регистрации
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.elements[0].value;
        const password = e.target.elements[1].value;
        const confirmPassword = e.target.elements[2].value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        const user = await registerUser(email, password);
        if (user) {
            alert('Регистрация успешна! Теперь войдите в систему.');
            showSection('login');
        }
    });
    
    // Добавляем обработчики переключения между формами
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('register');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        showSection('login');
    });
}

// Регистрация пользователя
async function registerUser(email, password) {
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Ошибка регистрации');
        
        return data;
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        alert(error.message);
        return null;
    }
}

// Авторизация пользователя
async function loginUser(email, password) {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Ошибка авторизации');
        
        // Сохраняем токен и данные пользователя
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        return data.user;
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        alert(error.message);
        return null;
    }
}