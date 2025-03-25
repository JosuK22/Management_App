const { Task, User } = require('../models'); // Import Sequelize models

// Create Task (Super Admin & Admin)
const createTask = async (req, res) => {
    try {
        const { employee_name, due_date, requirements, status, content, client_name, description, priority } = req.body;
        const { user } = req;

        if (user.role !== 'superadmin' && user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only Super Admin and Admin can create tasks" });
        }

        const task = await Task.create({
            employee_name,
            due_date,
            requirements,
            status,
            content,
            client_name,
            description,
            priority
        });

        res.status(201).json({ message: "Task created successfully", task });
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Tasks (Super Admin & Admin see all, Employee sees assigned tasks)
const getTasks = async (req, res) => {
    try {
        const { user } = req;
        let whereCondition = {};

        if (user.role === 'employee') {
            whereCondition.employee_name = user.name;
        }

        const tasks = await Task.findAll({ where: whereCondition });

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => date.toISOString().split('T')[0];

        const formattedToday = formatDate(today);
        const formattedTomorrow = formatDate(tomorrow);

        let pendingTasks = [];
        let dueTodayTasks = [];
        let dueTomorrowTasks = [];
        let notifications = [];

        tasks.forEach(task => {
            let dueDate = new Date(task.due_date);
            if (user.role === 'employee') {
                dueDate.setDate(dueDate.getDate() - 2);
                if (dueDate.getDay() === 0) dueDate.setDate(dueDate.getDate() - 1);
            }

            const formattedDueDate = formatDate(dueDate);
            task.due_date = dueDate.toLocaleDateString("en-GB").replace(/\//g, "-");

            if (formattedDueDate < formattedToday) pendingTasks.push(task);
            if (formattedDueDate === formattedToday) {
                pendingTasks.push(task);
                dueTodayTasks.push(task);
            }
            if (formattedDueDate === formattedTomorrow) {
                dueTomorrowTasks.push(task);
                notifications.push({
                    user: 'employee',
                    message: `Task : "${task.description}" is due tomorrow!`,
                    taskId: task.id
                });
                if (user.role === 'superadmin') {
                    notifications.push({
                        user: 'superadmin',
                        message: `Task for"${task.client_name}" assigned to ${task.employee_name} is due tomorrow!`,
                        taskId: task.id
                    });
                }
                if (user.role === 'employee' && task.employee_name === user.name) {
                    notifications.push({
                        user: 'employee',
                        message: `Reminder: Task "${task.title}" is due tomorrow!`,
                        taskId: task.id
                    });
                }
            }
        });

        res.status(200).json({
            allTasks: tasks,
            pendingTasks,
            dueTodayTasks,
            dueTomorrowTasks,
            notifications
        });
    } catch (error) {
        console.error("Get Tasks Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update Task (Super Admin & Admin can update any task, Employee can only update status)
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...otherFields } = req.body;
        const { user } = req;

        const task = await Task.findByPk(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (user.role === 'superadmin' || user.role === 'admin') {
            await task.update(otherFields);
        } else if (user.role === 'employee') {
            if (!status) return res.status(403).json({ message: "Employees can only update status" });
            if (task.employee_name !== user.name) return res.status(403).json({ message: "Unauthorized" });
            await task.update({ status });
        } else {
            return res.status(403).json({ message: "Forbidden: You do not have permission" });
        }

        res.status(200).json({ message: "Task updated successfully", task });
    } catch (error) {
        console.error("Update Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update task status (employee only)
const updateTaskStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { user } = req;

        const validStatuses = ['not started', 'inprogress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Valid statuses: 'not started', 'inprogress', 'done'." });
        }

        if (user.role !== 'employee') {
            return res.status(403).json({ message: "Forbidden: Only employees can update task status" });
        }

        const task = await Task.findByPk(id);
        if (!task || task.employee_name !== user.name) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        await task.update({ status });
        res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
        console.error("Update Task Status Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete Task (Only Super Admin & Admin)
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { user } = req;

        if (user.role !== 'superadmin' && user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only Super Admin and Admin can delete tasks" });
        }

        const task = await Task.findByPk(id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        await task.destroy();
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Delete Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createTask, getTasks, updateTask, updateTaskStatus, deleteTask };
