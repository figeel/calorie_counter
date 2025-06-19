import { loadCurrentUser } from './auth.js';
import { initNavigation } from './navigation.js';
import { initCalculator } from './calculator.js';
import { initAuthForms } from './auth.js';
import { showSection } from './navigation.js';

export function initApp() {
    // Загрузка состояния приложения
    const currentUser = loadCurrentUser();
    
    // Инициализация модулей
    initNavigation(currentUser);
    initCalculator();
    initAuthForms();
    
    // Показ стартового раздела
    if (currentUser) {
        showSection('calculator');
    } else {
        showSection('login');
    }
}