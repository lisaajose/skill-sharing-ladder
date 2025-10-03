// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Import database connection
const pool = require('./db'); // This will also log connection status

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const skillRoutes = require('./routes/skills');
const matchRoutes = require('./routes/matches');
const sessionRoutes = require('./routes/sessions');
const progressRoutes = require('./routes/progress'); // Add this line

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes); // Add this line

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Skill Sharing Ladder Backend is running!');
});

// Global Error Handler (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});