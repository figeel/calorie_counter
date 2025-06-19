import { registerUser, loginUser } from './api.js';
import { renderNavigation } from './navigation.js';
import { showSection } from './navigation.js';

let currentUser = null;

export function loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

export function initAuthForms() {
    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('register-form')?.addEventListener('submit', handleRegister);
    
    // Обработчики переключения форм
    document.getElementById('show-register')?.addEventListener('click', () => showSection('register'));
    document.getElementById('show-login')?.addEventListener('click', () => showSection('login'));
}

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.elements[0].value;
    const password = e.target.elements[1].value;
    
    const user = await loginUser(email, password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        renderNavigation(currentUser);
        showSection('calculator');
    }
}

async function handleRegister(e) {
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
}

export function logout() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    renderNavigation(currentUser);
    showSection('calculator');
    alert('Вы успешно вышли из системы');
}