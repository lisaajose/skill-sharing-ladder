// db.js
require('dotenv').config();
const mysql = require('mysql2/promise'); // Using promise-based wrapper

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database!');
        connection.release(); // Release the connection
    })
    .catch(err => {
        console.error('Error connecting to database:', err.stack);
        process.exit(1); // Exit if DB connection fails
    });

module.exports = pool;