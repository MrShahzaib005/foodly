/* ===================================================
   THE BACKEND SERVER (Node.js + Express)
   =================================================== */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = 3000;

// 1. MIDDLEWARE
// Allows your frontend (port 5500) to talk to backend (port 3000)
app.use(cors());
app.use(bodyParser.json());

// 2. DATABASE CONNECTION
// UPDATE THESE FIELDS with your real database info
const db = mysql.createConnection({
    host: '',
    user: '', 
    password: '',  // <--- You must type it inside the quotes
    database: ''
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to MySQL Database');
});

// 3. API ROUTES
// These replace the functions in your old db.js
// GET Single Restaurant by ID
app.get('/api/restaurants/:id', (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM restaurants WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: "Not found" });
        res.json(results[0]); // Return the first object, not an array
    });
});
// GET all restaurants
app.get('/api/restaurants', (req, res) => {
    const sql = "SELECT * FROM restaurants";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// GET menu for a specific restaurant
app.get('/api/menu/:restaurantId', (req, res) => {
    const id = req.params.restaurantId;
    const sql = "SELECT * FROM menu_items WHERE restaurant_id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// PLACE ORDER (POST request)
// PLACE ORDER (POST request)
app.post('/api/orders', (req, res) => {
    const { userId, total, items, address, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
    }

    // 1. INSERT INTO ORDERS TABLE
    // Note: We use '?' placeholders to prevent SQL Injection
    const orderSql = "INSERT INTO orders (user_id, total_amount, address, status) VALUES (?, ?, ?, 'pending')";
    
    // For now, if userId is missing (guest), we store NULL. 
    // If you want to force login, checking logic happens on frontend.
    const userVal = userId || null; 

    db.query(orderSql, [userVal, total, address], (err, result) => {
        if (err) {
            console.error("Order Insert Error:", err);
            return res.status(500).json({ error: err.message });
        }

        const newOrderId = result.insertId;
        console.log("✅ Order Created ID:", newOrderId);

        // 2. INSERT ORDER ITEMS
        // We need to loop through items and prepare a bulk insert
        const itemValues = items.map(item => [
            newOrderId, 
            item.id, 
            item.qty, 
            item.price // Store snapshot price
        ]);

        const itemsSql = "INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_time_of_order) VALUES ?";

        db.query(itemsSql, [itemValues], (err, result) => {
            if (err) {
                console.error("Items Insert Error:", err);
                return res.status(500).json({ error: "Failed to save order items" });
            }

            console.log(`✅ Saved ${result.affectedRows} items for Order ${newOrderId}`);
            res.json({ message: "Order placed successfully!", orderId: newOrderId });
        });
    });
});

// REGISTER USER (POST request)
app.post('/api/signup', (req, res) => {
    const { fullName, email, password } = req.body;

    // 1. Check if user already exists
    const checkSql = "SELECT * FROM users WHERE email = ?";
    db.query(checkSql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (results.length > 0) {
            return res.status(400).json({ message: "Email already registered" });
        }

        // 2. Insert new user
        // WARNING: In a real app, you MUST hash the password (e.g. bcrypt). 
        // For this student project, storing plain text is acceptable but risky.
        const insertSql = "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)";
        
        db.query(insertSql, [fullName, email, password], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            // Return the new User ID so frontend can log them in
            res.json({ 
                message: "User registered!", 
                userId: result.insertId,
                name: fullName 
            });
        });
    });
});

// LOGIN USER (POST request) - Replacing your frontend mock login logic
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        if (results.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = results[0];
        // Send back the user info
        res.json({
            message: "Login successful",
            userId: user.id,
            name: user.full_name,
            email: user.email,
            token: "mock_token_" + user.id // In real apps, use JWT
        });
    });
});

// 4. START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});