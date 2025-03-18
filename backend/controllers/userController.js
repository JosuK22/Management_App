const { pool } = require('../app');
const bcrypt = require('bcryptjs');

// Add a new Admin or Employee (Only SuperAdmin)
const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!['admin', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Only admin or employee can be added.' });
    }

    try {
        // Check if user already exists
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ message: 'User added successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a user (Only SuperAdmin)
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Prevent deletion of SuperAdmin
        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete the SuperAdmin.' });
        }

        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Promote an Admin to SuperAdmin (Demotes current SuperAdmin)
const promoteAdmin = async (req, res) => {
    const { id } = req.params;

    try {
        // Get current SuperAdmin
        const currentSuperAdmin = await pool.query('SELECT * FROM users WHERE role = $1', ['superadmin']);
        const newSuperAdmin = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

        if (newSuperAdmin.rows.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (newSuperAdmin.rows[0].role !== 'admin') {
            return res.status(400).json({ message: 'Only an admin can be promoted to SuperAdmin.' });
        }

        // Update roles
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', currentSuperAdmin.rows[0].id]);
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['superadmin', id]);

        res.status(200).json({ message: 'Admin promoted to SuperAdmin successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (Admins and Employees)
const getAllUsers = async (req, res) => {
    try {
      const result = await pool.query("SELECT id, name, email, role FROM users WHERE role != 'superadmin'");
      res.status(200).json({ users: result.rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error while fetching users' });
    }
};

  // Update user details (email or password)
  const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password } = req.body;
  
    try {
      let query = 'UPDATE users SET';
      const params = [];
      
      if (email) {
        params.push(email);
        query += ` email = $${params.length},`;
      }
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        params.push(hashedPassword);
        query += ` password = $${params.length},`;
      }
  
      query = query.slice(0, -1); // Remove last comma
      params.push(id);
      query += ` WHERE id = $${params.length} RETURNING id, name, email, role`;
  
      const result = await pool.query(query, params);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({ message: 'User updated successfully', user: result.rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating user' });
    }
  };

  // Promote an Employee to Admin (Only SuperAdmin)
  const promoteEmployee = async (req, res) => {
    const { id } = req.params;
    const { user } = req; // Assuming `user` is extracted from authentication middleware

    try {
        // Ensure only SuperAdmin can promote employees
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden: Only SuperAdmin can promote employees.' });
        }

        // Check if the user exists
        const employeeResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (employeeResult.rows.length === 0) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // Ensure the user is an employee
        if (employeeResult.rows[0].role !== 'employee') {
            return res.status(400).json({ message: 'Only an employee can be promoted to admin.' });
        }

        // Promote employee to admin
        await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', id]);

        res.status(200).json({ message: 'Employee promoted to Admin successfully.' });
    } catch (error) {
        console.error("Promote Employee Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add a new client (only Admin or SuperAdmin can do this)
const addClient = async (req, res) => {
  const { client_name, phone_number, requirements, package, description } = req.body;

  // Validate that the required fields are provided
  if (!client_name || !phone_number || !requirements || !package || !description) {
      return res.status(400).json({ message: 'Missing required fields' });
  }

  // Validate that the requirements field has valid numbers
  if (typeof requirements.reel !== 'number' || typeof requirements.video !== 'number' || typeof requirements.poster !== 'number') {
      return res.status(400).json({ message: 'Requirements should contain numeric values for reel, video, and poster' });
  }

  try {
      // Check if the user is an admin or superadmin (assuming `req.user.role` is available from authMiddleware)
      const { role } = req.user;
      if (role !== 'admin' && role !== 'superadmin') {
          return res.status(403).json({ message: 'Forbidden: You do not have permission to add a client.' });
      }

      // Insert the new client details into the database
      await pool.query(
          `INSERT INTO clients (client_name, phone_number, requirements, package, description) 
          VALUES ($1, $2, $3, $4, $5)`,
          [client_name, phone_number, JSON.stringify(requirements), package, description]
      );

      res.status(201).json({ message: 'Client added successfully.' });
  } catch (error) {
      console.error('Error adding client:', error);
      res.status(500).json({ message: 'Server error while adding client' });
  }
};

module.exports = { addUser, deleteUser, promoteAdmin, getAllUsers, updateUser, promoteEmployee, addClient };
