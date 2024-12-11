const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// إعداد قاعدة البيانات
const db = new sqlite3.Database('./products.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// إنشاء جدول المنتجات إذا لم يكن موجودًا
db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    category TEXT,
    image TEXT
)`);

// مسار GET افتراضي لتقديم index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API routes
app.post('/api/products', (req, res) => {
    const { name, price, description, category, image } = req.body;
    db.run(`INSERT INTO products (name, price, description, category, image) VALUES (?, ?, ?, ?, ?)`, 
        [name, price, description, category, image], 
        function(err) {
            if (err) {
                return res.status(400).send(err.message);
            }
            res.status(201).json({ id: this.lastID, name, price, description, category, image });
        }
    );
});

app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) {
            return res.status(400).send(err.message);
        }
        res.json(rows);
    });
});

// إغلاق قاعدة البيانات عند إيقاف الخادم
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Closed the database connection.');
        process.exit(0);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});