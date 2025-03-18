// backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { initializePassport } = require('./passportConfig'); // Import initializePassport function

// Load environment variables
dotenv.config();

console.log('App running....');
// Initialize express app
const app = express();

// Database connection using Koyeb PostgreSQL URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

// Middleware
app.use(express.json());
app.use(cors());

// Check DB connection
pool.connect()
  .then(() => {
    console.log('Successfully connected to the database!');
    // Now initialize Passport after the pool has been connected
    initializePassport(pool); // Initialize Passport with the database pool
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Test DB Connection (example route)
app.get('/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
});

module.exports = { app, pool };
