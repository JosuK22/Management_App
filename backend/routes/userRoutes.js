const express = require('express');
const { addUser, deleteUser, promoteAdmin, promoteEmployee, getAllUsers, updateUser, getUserById } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkRole  = require('../middlewares/roleMiddleware');

const router = express.Router();

// Add Employee or Admin (Only SuperAdmin)
router.post('/add-user', authMiddleware, checkRole(['superadmin']), addUser);

// Delete Employee or Admin (Only SuperAdmin)
router.delete('/delete-user/:id', authMiddleware, checkRole(['superadmin']), deleteUser);

// Promote an Admin to SuperAdmin (Only SuperAdmin)
router.put('/promote-admin/:id', authMiddleware, checkRole(['superadmin']), promoteAdmin);

// Promote an Employee to Admin (Only SuperAdmin)
router.put('/promote-employee/:id', authMiddleware, checkRole(['superadmin']), promoteEmployee);

// Get all users (Admins and Employees) - Only SuperAdmin can access
router.get('/users', authMiddleware, checkRole(['superadmin']), getAllUsers);

// Get a single employee (Only Admin and SuperAdmin)
router.get('/user/:id', authMiddleware, checkRole(['admin', 'superadmin']), getUserById);

// Update user (email or password) - Only SuperAdmin can update Admins and Employees
router.put('/users/:id', authMiddleware, checkRole(['superadmin']), updateUser);

module.exports = router;
