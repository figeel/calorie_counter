const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { db, initDatabase } = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_strong_secret_key_here';

// Инициализация БД
initDatabase();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для проверки JWT
function authenticate(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Требуется авторизация' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Неверный токен' });
    }
}

// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    try {
        // Проверка существующего пользователя
        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Создание пользователя
        const result = db.prepare(`
            INSERT INTO users (email, password) 
            VALUES (?, ?)
        `).run(email, hashedPassword);

        res.status(201).json({ 
            id: result.lastInsertRowid, 
            email,
            role: 'user'
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Авторизация пользователя
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверные учетные данные' });
        }

        // Создание JWT токена
        const token = jwt.sign({ 
            id: user.id, 
            email: user.email, 
            role: user.role 
        }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение списка продуктов
app.get('/api/products', (req, res) => {
    try {
        const search = req.query.search || '';
        const query = `
            SELECT * FROM products 
            WHERE is_approved = 1 
            AND name LIKE ?
            ORDER BY name
        `;
        const products = db.prepare(query).all(`%${search}%`);
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения продуктов' });
    }
});

// Добавление нового продукта (только для авторизованных)
app.post('/api/products', authenticate, (req, res) => {
    const { name, calories, proteins, fats, carbs } = req.body;
    const userId = req.user.id;

    if (!name || !calories || !proteins || !fats || !carbs) {
        return res.status(400).json({ error: 'Все поля обязательны' });
    }

    try {
        const result = db.prepare(`
            INSERT INTO products (name, calories, proteins, fats, carbs, added_by)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(name, calories, proteins, fats, carbs, userId);

        res.status(201).json({
            id: result.lastInsertRowid,
            name,
            calories,
            proteins,
            fats,
            carbs,
            added_by: userId,
            is_approved: 0
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Продукт с таким названием уже существует' });
        }
        res.status(500).json({ error: 'Ошибка добавления продукта' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});