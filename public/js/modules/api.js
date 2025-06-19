const API_BASE_URL = '/api';

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
    return apiRequest('/login', 'POST', { email, password });
}

async function apiRequest(endpoint, method, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
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