const API_BASE_URL = '/api';

// Явно экспортируем функцию apiRequest
export async function apiRequest(endpoint, method, data) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Добавляем токен авторизации, если он есть
        const token = localStorage.getItem('authToken');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            throw new Error(responseData.error || 'Ошибка API');
        }
        
        return responseData;
    } catch (error) {
        console.error(`Ошибка ${method} ${endpoint}:`, error);
        alert(error.message);
        return null;
    }
}

// Остальные функции
export async function searchProducts(query) {
    try {
        const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Ошибка поиска продуктов');
        return await response.json();
    } catch (error) {
        console.error('Ошибка API:', error);
        return [];
    }
}

export async function registerUser(email, password) {
    return apiRequest('/register', 'POST', { email, password });
}

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка авторизации');
        }
        
        return data; // Возвращаем весь объект { token, user }
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
}

// Экспортируем функции для админ-панели
export async function getAdminUsers() {
    return apiRequest('/admin/users', 'GET');
}

export async function updateUserRole(userId, role) {
    return apiRequest(`/admin/users/${userId}/role`, 'PUT', { role });
}

export async function getPendingProducts() {
    return apiRequest('/admin/products/pending', 'GET');
}

export async function approveProduct(productId) {
    return apiRequest(`/admin/products/${productId}/approve`, 'PUT');
}

export async function deleteProduct(productId) {
    return apiRequest(`/admin/products/${productId}`, 'DELETE');
}