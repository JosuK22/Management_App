// backend/routes/clientRoutes.js
const express = require('express');
const { addClient, getAllClients, getClientById, updateClient, deleteClient} = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/roleMiddleware');

const router = express.Router();

// Add a new client (Only Admin or SuperAdmin)
router.post('/add-clients', authMiddleware, checkRole(['admin', 'superadmin']), (req, res, next) => {
    console.log('Add Client Request:', req.body);  // Log the request details
    next();
}, addClient);

// Get all clients (Admin & SuperAdmin)
router.get('/clients', authMiddleware, checkRole(['admin', 'superadmin']), (req, res, next) => {
    console.log('Get All Clients Request:', req.query);  // Log the request details
    next();
}, getAllClients);

// Get a single client by ID (Admin & SuperAdmin)
router.get('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), (req, res, next) => {
    console.log('Get Client by ID Request:', req.params);  // Log the request details
    next();
}, getClientById);

// Update client details (Only Admin & SuperAdmin)
router.put('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), (req, res, next) => {
    console.log('Update Client Request:', req.body);  // Log the request details
    next();
}, updateClient);

// Delete a client (Only Admin or SuperAdmin)
router.delete('/clients/:id', authMiddleware, checkRole(['admin', 'superadmin']), (req, res, next) => {
    console.log('Delete Client Request:', req.params);  // Log the request details
    next();
}, deleteClient);

module.exports = router;
