const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

// Создаем/подключаем базу данных
const db = new Database(path.join(__dirname, 'calorie-counter.db'));

// Включаем поддержку внешних ключей
db.pragma('foreign_keys = ON');

// Инициализация базы данных
function initDatabase() {
    try {
        // Создаем таблицу пользователей
        db.prepare(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `).run();

        // Создаем таблицу продуктов
        db.prepare(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                calories REAL NOT NULL,
                proteins REAL NOT NULL,
                fats REAL NOT NULL,
                carbs REAL NOT NULL,
                added_by INTEGER,
                is_approved BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (added_by) REFERENCES users(id)
            )
        `).run();

        // Добавляем системного пользователя
        const systemUserPassword = bcrypt.hashSync('system_password', 10);
        db.prepare(`
            INSERT OR IGNORE INTO users (id, email, password, role)
            VALUES (-1, 'system@caloriecounter.com', ?, 'system')
        `).run(systemUserPassword);

        // Добавляем администратора по умолчанию
        const adminEmail = 'admin@example.com';
        const adminPassword = bcrypt.hashSync('adminpassword', 10);
        db.prepare(`
            INSERT OR IGNORE INTO users (email, password, role)
            VALUES (?, ?, 'admin')
        `).run(adminEmail, adminPassword);

        // Добавляем тестового пользователя
        const userEmail = 'user@example.com';
        const userPassword = bcrypt.hashSync('userpassword', 10);
        db.prepare(`
            INSERT OR IGNORE INTO users (email, password)
            VALUES (?, ?)
        `).run(userEmail, userPassword);

        // Добавляем базовые продукты
        const initialProducts = [
            { name: "Яблоко", calories: 52, proteins: 0.3, fats: 0.2, carbs: 14 },
            { name: "Куриная грудка", calories: 165, proteins: 31, fats: 3.6, carbs: 0 },
            { name: "Рис вареный", calories: 130, proteins: 2.7, fats: 0.3, carbs: 28 },
            { name: "Бананы", calories: 89, proteins: 1.1, fats: 0.3, carbs: 23 },
            { name: "Овсянка", calories: 68, proteins: 2.4, fats: 1.4, carbs: 12 },
            { name: "Яйцо куриное", calories: 155, proteins: 13, fats: 11, carbs: 1.1 },
            { name: "Творог 5%", calories: 121, proteins: 17, fats: 5, carbs: 3 },
            { name: "Гречка вареная", calories: 101, proteins: 4, fats: 1, carbs: 21 },
            { name: "Картофель вареный", calories: 86, proteins: 1.7, fats: 0.1, carbs: 20 },
            { name: "Молоко 2.5%", calories: 52, proteins: 2.9, fats: 2.5, carbs: 4.7 }
        ];

        const insertProduct = db.prepare(`
            INSERT OR IGNORE INTO products (name, calories, proteins, fats, carbs, added_by, is_approved)
            VALUES (?, ?, ?, ?, ?, -1, 1)
        `);

        initialProducts.forEach(product => {
            insertProduct.run(
                product.name,
                product.calories,
                product.proteins,
                product.fats,
                product.carbs
            );
        });

        console.log('✅ База данных инициализирована');
        console.log('👑 Администратор: admin@example.com / adminpassword');
        console.log('👤 Пользователь: user@example.com / userpassword');
        
        // Статистика
        const usersCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
        const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
        console.log(`👥 Пользователей: ${usersCount}`);
        console.log(`🍎 Продуктов: ${productsCount}`);
    } catch (error) {
        console.error('❌ Ошибка инициализации БД:', error);
    }
}

module.exports = {
    db,
    initDatabase
};