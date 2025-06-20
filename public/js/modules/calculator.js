import { searchProducts as apiSearch } from './api.js';

let selectedProducts = [];

export function initCalculator() {
    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', handleSearch);
}

async function handleSearch(e) {
    const query = e.target.value.trim();
    const searchResults = document.getElementById('search-results');
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    // Показываем индикатор загрузки
    searchResults.innerHTML = '<div class="loading">Поиск продуктов...</div>';
    
    try {
        const products = await searchApprovedProducts(query);
        displaySearchResults(products);
    } catch (error) {
        searchResults.innerHTML = '<div class="error">Ошибка загрузки продуктов</div>';
    }
}

async function searchApprovedProducts(query) {
    try {
        const allProducts = await apiSearch(query);
        return allProducts.filter(product => product.is_approved === 1);
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return [];
    }
}

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

function addProductToCalculator(product) {
    if (selectedProducts.some(p => p.id === product.id)) {
        alert('Этот продукт уже добавлен!');
        return;
    }
    
    const productWithGrams = { ...product, grams: 100 };
    selectedProducts.push(productWithGrams);
    renderSelectedProducts();
}

function renderSelectedProducts() {
    const tbody = document.querySelector('#selected-products tbody');
    tbody.innerHTML = '';
    
    let totals = { 
        grams: 0, 
        calories: 0, 
        proteins: 0, 
        fats: 0, 
        carbs: 0 
    };
    
    selectedProducts.forEach((product, index) => {
        const nutrients = calculateNutrients(product);
        
        // Обновляем суммарный вес
        totals.grams += product.grams;
        
        // Обновляем суммарные нутриенты
        totals.calories += parseFloat(nutrients.calories);
        totals.proteins += parseFloat(nutrients.proteins);
        totals.fats += parseFloat(nutrients.fats);
        totals.carbs += parseFloat(nutrients.carbs);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td><input type="number" value="${product.grams}" min="1" 
                 class="grams-input" data-index="${index}"></td>
            <td>${nutrients.calories}</td>
            <td>${nutrients.proteins}</td>
            <td>${nutrients.fats}</td>
            <td>${nutrients.carbs}</td>
            <td><button class="remove-btn" data-index="${index}">Удалить</button></td>
        `;
        tbody.appendChild(row);
    });
    
    updateTotalRow(totals);
    setupProductHandlers();
}

// Функция объявлена ОДИН РАЗ здесь
function calculateNutrients(product) {
    // Защита от нечисловых значений
    const grams = isNaN(product.grams) ? 100 : product.grams;
    const ratio = grams / 100;
    
    return {
        calories: ((product.calories || 0) * ratio).toFixed(1),
        proteins: ((product.proteins || 0) * ratio).toFixed(1),
        fats: ((product.fats || 0) * ratio).toFixed(1),
        carbs: ((product.carbs || 0) * ratio).toFixed(1)
    };
}

function updateTotalRow(totals) {
    document.getElementById('total-grams').textContent = totals.grams;
    document.getElementById('total-calories').textContent = totals.calories.toFixed(1);
    document.getElementById('total-proteins').textContent = totals.proteins.toFixed(1);
    document.getElementById('total-fats').textContent = totals.fats.toFixed(1);
    document.getElementById('total-carbs').textContent = totals.carbs.toFixed(1);
}

function setupProductHandlers() {
    document.querySelectorAll('.grams-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            const grams = parseInt(e.target.value) || 100; // Защита от NaN
            
            if (index >= 0 && index < selectedProducts.length) {
                selectedProducts[index].grams = grams;
                renderSelectedProducts();
            }
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            if (index >= 0 && index < selectedProducts.length) {
                selectedProducts.splice(index, 1);
                renderSelectedProducts();
            }
        });
    });
}