const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./config/database.js'); // Import Sequelize instance
const { initializePassport } = require('./passportConfig');

dotenv.config();

console.log('App running...');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Test Database Connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to database');
    initializePassport(sequelize); // If needed, adjust this to use Sequelize
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Test Route with Sequelize
app.get('/test', async (req, res) => {
  try {
    const [results, metadata] = await sequelize.query('SELECT * FROM users;');
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).send('Database error');
  }
});

module.exports = { app, sequelize };
