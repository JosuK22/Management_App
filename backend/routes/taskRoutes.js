const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Super Admin & Admin can create, update, delete, and assign tasks
router.post('/', roleMiddleware(['superadmin', 'admin']), taskController.createTask);
router.put('/:id', roleMiddleware(['superadmin', 'admin']), taskController.updateTask);
router.delete('/:id', roleMiddleware(['superadmin', 'admin']), taskController.deleteTask);

// All users can view tasks (Admins see all, Employees see assigned tasks)
router.get('/', roleMiddleware(['superadmin', 'admin', 'employee']), taskController.getTasks);

// Employees can only update their task status
router.patch('/:id/status', roleMiddleware(['employee']), taskController.updateTaskStatus);

module.exports = router;
