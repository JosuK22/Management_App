'use strict';
const { v4: uuidv4 } = require('uuid'); // UUID for user IDs
const bcrypt = require('bcryptjs'); // Use the same hashing strategy
require('dotenv').config(); // Load environment variables

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const saltRounds = 10; // Same salt rounds used in passportConfig.js

    return queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(), // Generate UUID
        name: 'Admin User',
        email: 'megha@gmail.com',
        password: await bcrypt.hash('password123', saltRounds), // Hash password
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'John Doe',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', saltRounds), // Hash password
        role: 'employee',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
