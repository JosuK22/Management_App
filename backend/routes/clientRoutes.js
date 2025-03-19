// clientRoutes.js
const express = require('express');
const { addClient, getAllClients, getClientById, updateClient, deleteClient} = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const  checkRole  = require('../middlewares/roleMiddleware');

const router = express.Router();

// Add a new client (Only Admin or SuperAdmin)
router.post('/add-client', authMiddleware, checkRole(['admin', 'superadmin']), addClient);

// Get all clients (Admin & SuperAdmin)
router.get('/clients', authMiddleware, checkRole(['admin', 'superadmin']), getAllClients);

// Get a single client by ID (Admin & SuperAdmin)
router.get('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), getClientById);

// Update client details (Only Admin & SuperAdmin)
router.put('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), updateClient);

// Delete a client (Only Admin or SuperAdmin)
router.delete('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), deleteClient);

module.exports = router;
