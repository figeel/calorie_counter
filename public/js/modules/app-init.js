import { loadCurrentUser } from './auth.js';
import { initNavigation, showSection } from './navigation.js';
import { initCalculator } from './calculator.js';
import { initAuthForms } from './auth.js';
import { initAdminPanel } from './admin.js';

export function initApp() {
    // Загрузка состояния приложения
    const currentUser = loadCurrentUser();
    
    // Инициализация навигации
    initNavigation(currentUser);
    
    // Инициализация модулей
    initCalculator();
    initAuthForms();
    
    // Инициализация админ-панели
    if (currentUser?.role === 'admin') {
        initAdminPanel();
    }
    
    // Показ стартового раздела
    if (currentUser) {
        showSection('calculator');
    } else {
        showSection('login');
    }
}