import { logout } from './auth.js';

// Глобальный обработчик для всей навигации
let navigationHandler = null;

export function initNavigation(currentUser) {
    renderNavigation(currentUser);
    
    // Удаляем старый обработчик, если он был
    if (navigationHandler) {
        document.body.removeEventListener('click', navigationHandler);
    }
    
    // Создаем новый обработчик
    navigationHandler = handleNavigationEvents;
    document.body.addEventListener('click', navigationHandler);
}

export function renderNavigation(currentUser) {
    const nav = document.getElementById('nav');
    if (!nav) return;

    nav.innerHTML = `
        <ul>
            <li><a href="#" data-section="calculator">Калькулятор</a></li>
            ${currentUser ? `
                <li><span>Привет, ${currentUser.email}</span></li>
                <li><a href="#" id="logout">Выйти</a></li>
                <!-- Добавили кнопку добавления продукта -->
                <li><a href="#" data-section="add-product">Добавить продукт</a></li>
                ${currentUser.role === 'admin' ? `
                    <li><a href="#" data-section="admin">Админ-панель</a></li>
                ` : ''}
            ` : `
                <li><a href="#" data-section="login">Войти</a></li>
                <li><a href="#" data-section="register">Регистрация</a></li>
            `}
        </ul>
    `;
}

function handleNavigationEvents(e) {
    // Обработка навигационных ссылок
    if (e.target.matches('nav a[data-section]')) {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        showSection(section);
        return;
    }
    
    // Обработка кнопки выхода
    if (e.target.id === 'logout') {
        e.preventDefault();
        logout();
        return;
    }
    
    // Обработка переключения форм
    if (e.target.id === 'show-register') {
        e.preventDefault();
        showSection('register');
        return;
    }
    
    if (e.target.id === 'show-login') {
        e.preventDefault();
        showSection('login');
        return;
    }
}

export function showSection(sectionId) {
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