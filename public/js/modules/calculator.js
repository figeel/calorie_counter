import { searchProducts } from './api.js';

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
    
    const products = await searchProducts(query);
    displaySearchResults(products);
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
    
    let totals = { grams: 0, calories: 0, proteins: 0, fats: 0, carbs: 0 };
    
    selectedProducts.forEach((product, index) => {
        const nutrients = calculateNutrients(product);
        updateTotals(totals, nutrients);
        
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

function calculateNutrients(product) {
    const ratio = product.grams / 100;
    return {
        calories: (product.calories * ratio).toFixed(1),
        proteins: (product.proteins * ratio).toFixed(1),
        fats: (product.fats * ratio).toFixed(1),
        carbs: (product.carbs * ratio).toFixed(1)
    };
}

function updateTotals(totals, nutrients) {
    totals.grams += parseFloat(nutrients.grams);
    totals.calories += parseFloat(nutrients.calories);
    totals.proteins += parseFloat(nutrients.proteins);
    totals.fats += parseFloat(nutrients.fats);
    totals.carbs += parseFloat(nutrients.carbs);
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
            const grams = parseInt(e.target.value) || 100;
            selectedProducts[index].grams = grams;
            renderSelectedProducts();
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            selectedProducts.splice(index, 1);
            renderSelectedProducts();
        });
    });
}