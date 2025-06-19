import { 
    getAdminUsers, 
    updateUserRole, 
    getPendingProducts, 
    approveProduct, 
    deleteProduct 
} from './api.js';

import { showNotification } from './utils.js';

let currentAdminData = {
    users: [],
    pendingProducts: []
};

export function initAdminPanel() {
    const adminSection = document.getElementById('admin-section');
    if (!adminSection) return;
    
    loadAdminData();
    setupAdminTabs();
    document.getElementById('admin-section').addEventListener('click', handleAdminActions);
}

function setupAdminTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active-tab'));
            
            btn.classList.add('active');
            const tabId = btn.dataset.tab;
            document.getElementById(`admin-${tabId}`).classList.add('active-tab');
        });
    });
}

async function loadAdminData() {
    try {
        const users = await getAdminUsers();
        currentAdminData.users = users;
        renderUsersTable(users);
        
        const products = await getPendingProducts();
        currentAdminData.pendingProducts = products;
        renderProductsTable(products);
    } catch (error) {
        showNotification(`Ошибка загрузки данных: ${error.message}`, 'error');
    }
}

function renderUsersTable(users) {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.email}</td>
            <td>
                <select class="role-select" data-user-id="${user.id}">
                    <option value="user" ${user.role === 'user' ? 'selected' : ''}>Пользователь</option>
                    <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Администратор</option>
                </select>
            </td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td>
                <button class="admin-btn btn-save" data-action="save-role" data-user-id="${user.id}">Сохранить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderProductsTable(products) {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>
                ${product.calories} ккал, 
                Б: ${product.proteins}г, 
                Ж: ${product.fats}г, 
                У: ${product.carbs}г
            </td>
            <td>${product.added_by_email}<br>${new Date(product.created_at).toLocaleDateString()}</td>
            <td class="admin-actions">
                <button class="admin-btn btn-approve" data-action="approve-product" data-product-id="${product.id}">Одобрить</button>
                <button class="admin-btn btn-reject" data-action="reject-product" data-product-id="${product.id}">Отклонить</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function handleAdminActions(e) {
    const target = e.target;
    if (!target.classList.contains('admin-btn')) return;
    
    const action = target.dataset.action;
    const userId = target.dataset.userId;
    const productId = target.dataset.productId;
    
    try {
        if (action === 'save-role' && userId) {
            const select = document.querySelector(`.role-select[data-user-id="${userId}"]`);
            const newRole = select.value;
            await updateUserRole(userId, newRole);
            showNotification('Роль пользователя успешно изменена', 'success');
        }
        else if (action === 'approve-product' && productId) {
            await approveProduct(productId);
            showNotification('Продукт одобрен', 'success');
            const products = await getPendingProducts();
            currentAdminData.pendingProducts = products;
            renderProductsTable(products);
        }
        else if (action === 'reject-product' && productId) {
            await deleteProduct(productId);
            showNotification('Продукт удален', 'success');
            const products = await getPendingProducts();
            currentAdminData.pendingProducts = products;
            renderProductsTable(products);
        }
    } catch (error) {
        showNotification(`Ошибка: ${error.message}`, 'error');
    }
}