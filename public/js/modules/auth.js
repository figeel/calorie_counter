import { registerUser, loginUser } from './api.js';
import { initNavigation, showSection } from './navigation.js'; // Добавляем импорт showSection

export function loadCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

export function initAuthForms() {
    // Форма входа
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const userData = await loginUser(email, password);
            if (userData) {
                localStorage.setItem('authToken', userData.token);
                localStorage.setItem('currentUser', JSON.stringify(userData.user));
                initNavigation(userData.user);
                showSection('calculator'); // Теперь showSection доступна
            }
        } catch (error) {
            alert(`Ошибка входа: ${error.message}`);
        }
    });
    
    // Форма регистрации
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        
        if (password !== confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        
        try {
            const user = await registerUser(email, password);
            if (user) {
                alert('Регистрация успешна! Теперь войдите в систему.');
                showSection('login'); // Используем showSection
                document.getElementById('register-form').reset();
            }
        } catch (error) {
            alert(`Ошибка регистрации: ${error.message}`);
        }
    });
}

export function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    initNavigation(null);
    showSection('calculator'); // Используем showSection
    alert('Вы успешно вышли из системы');
}