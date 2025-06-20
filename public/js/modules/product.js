import { addProduct } from './api.js';
import { showSection } from './navigation.js'; // Импортируем только showSection
import { showNotification } from './utils.js'; // Правильный импорт showNotification

export function initProductForm() {
    const form = document.getElementById('add-product-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('product-name').value.trim();
        const calories = parseFloat(document.getElementById('product-calories').value);
        const proteins = parseFloat(document.getElementById('product-proteins').value);
        const fats = parseFloat(document.getElementById('product-fats').value);
        const carbs = parseFloat(document.getElementById('product-carbs').value);
        
        // Валидация данных
        if (!name) {
            showNotification('Введите название продукта', 'error');
            return;
        }
        
        if (isNaN(calories) || isNaN(proteins) || isNaN(fats) || isNaN(carbs)) {
            showNotification('Некорректные значения КБЖУ', 'error');
            return;
        }
        
        try {
            // Отправляем продукт на сервер
            const newProduct = await addProduct({ 
                name, 
                calories, 
                proteins, 
                fats, 
                carbs 
            });
            
            // Обработка успешного добавления
            if (newProduct) {
                form.reset();
                showNotification('Продукт отправлен на модерацию! Скоро он появится в базе.', 'success');
                showSection('calculator');
            }
        } catch (error) {
            showNotification(`Ошибка добавления продукта: ${error.message}`, 'error');
        }
    });
}