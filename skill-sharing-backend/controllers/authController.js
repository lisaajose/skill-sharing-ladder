// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // Your database connection pool

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user already exists
        let [users] = await pool.query('SELECT * FROM Users WHERE email = ? OR username = ?', [email, username]);
        if (users.length > 0) {
            return res.status(400).json({ message: 'User with that email or username already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 3. Save user to DB
        const [result] = await pool.query(
            'INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );
        const userId = result.insertId;

        // 4. Generate JWT
        const payload = {
            user: {
                id: userId,
                username: username
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ message: 'User registered successfully', token, userId, username });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during registration');
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        let [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate JWT
        const payload = {
            user: {
                id: user.user_id,
                username: user.username
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ message: 'Logged in successfully', token, userId: user.user_id, username: user.username });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during login');
    }
};