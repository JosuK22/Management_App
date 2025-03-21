const { pool } = require('../app');

// Create Task (Super Admin & Admin)
const createTask = async (req, res) => {
    try {
        const { employee_name, due_date, requirements, status, content, client_name, description, priority } = req.body;
        
        const { user } = req;
        if (user.role !== 'superadmin' && user.role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only Super Admin and Admin can create tasks" });
        }

        const result = await pool.query(
            `INSERT INTO tasks (employee_name, due_date, requirements, status, content, client_name, description, priority)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [employee_name, due_date, requirements, status, content, client_name, description, priority]
        );

        res.status(201).json({ message: "Task created successfully", task: result.rows[0] });
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Tasks (Super Admin & Admin see all, Employee sees assigned tasks)
const getTasks = async (req, res) => {
    try {
        const { user } = req;
        let query;
        let values;

        if (user.role === 'superadmin' || user.role === 'admin') {
            query = 'SELECT * FROM tasks';
            values = [];
        } else if (user.role === 'employee') {
            query = 'SELECT * FROM tasks WHERE employee_name = $1';
            values = [user.name];
        } else {
            return res.status(403).json({ message: "Forbidden: You do not have permission" });
        }

        const result = await pool.query(query, values);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD format

        const formattedToday = formatDate(today);
        const formattedTomorrow = formatDate(tomorrow);

        let allTasks = [];
        let pendingTasks = [];
        let dueTodayTasks = [];
        let dueTomorrowTasks = [];
        let notifications = []; // To store notifications

        result.rows.forEach(task => {
            let dueDate = new Date(task.due_date);

            if (user.role === 'employee') {
                dueDate.setDate(dueDate.getDate() - 2);
                if (dueDate.getDay() === 0) { // If adjusted due date falls on Sunday, subtract one more day
                    dueDate.setDate(dueDate.getDate() - 1);
                }
            }

            const formattedDueDate = formatDate(dueDate);
            task.due_date = dueDate.toLocaleDateString("en-GB").replace(/\//g, "-"); // Format DD-MM-YYYY

            const taskData = {
                id: task.id,
                title: task.title,
                due_date: task.due_date,
                status: task.status,
                priority: task.priority,
                employee_name: task.employee_name, 
                client_name: task.client_name,
                description: task.description
            };

            allTasks.push(taskData);

            if (formattedDueDate < formattedToday) {
                pendingTasks.push(taskData); 
            }
            if (formattedDueDate === formattedToday) {
                pendingTasks.push(taskData); 
                dueTodayTasks.push(taskData);
            }
            if (formattedDueDate === formattedTomorrow) {
                dueTomorrowTasks.push(taskData);

                // Add a notification for tasks due tomorrow
                notifications.push({
                    user: 'employee',
                    message: `Task "${task.title}" is due tomorrow!`,
                    taskId: task.id
                });

                // If the user is a Super Admin, also notify them
                if (user.role === 'superadmin') {
                    notifications.push({
                        user: 'superadmin',
                        message: `Task "${task.title}" assigned to ${task.employee_name} is due tomorrow!`,
                        taskId: task.id
                    });
                }

                // If the user is the assigned employee, notify them as well
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
            allTasks,
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

        let query;
        let values;

        if (user.role === 'superadmin' || user.role === 'admin') {
            query = `UPDATE tasks SET ${Object.keys(otherFields).map((key, i) => `${key} = $${i + 1}`)} WHERE id = $${Object.keys(otherFields).length + 1} RETURNING *`;
            values = [...Object.values(otherFields), id];
        } else if (user.role === 'employee') {
            if (!status) {
                return res.status(403).json({ message: "Forbidden: Employees can only update status" });
            }
            query = 'UPDATE tasks SET status = $1 WHERE id = $2 AND employee_name = $3 RETURNING *';
            values = [status, id, user.name];
        } else {
            return res.status(403).json({ message: "Forbidden: You do not have permission" });
        }

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.status(200).json({ message: "Task updated successfully", task: result.rows[0] });
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

        // Ensure the status is one of the allowed values
        const validStatuses = ['not started', 'inprogress', 'done'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status. Valid statuses are: 'not started', 'inprogress', or 'done'." });
        }

        if (user.role !== 'employee') {
            return res.status(403).json({ message: "Forbidden: Only employees can update task status" });
        }

        // Update the task status in the database
        const result = await pool.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 AND employee_name = $3 RETURNING *',
            [status, id, user.name]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found or unauthorized" });
        }

        res.status(200).json({ message: "Task status updated successfully", task: result.rows[0] });
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

        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Delete Task Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { createTask, getTasks, updateTask, deleteTask, updateTaskStatus };

