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

        // Modify due_date for employees (showing 2 days earlier)
        const tasks = result.rows.map(task => {
            if (user.role === 'employee') {
                let dueDate = new Date(task.due_date);
                dueDate.setDate(dueDate.getDate() - 2); // Subtract 2 days
                task.due_date = dueDate.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            }
            return task;
        });

        res.status(200).json({ tasks });
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

module.exports = { createTask, getTasks, updateTask, deleteTask };

