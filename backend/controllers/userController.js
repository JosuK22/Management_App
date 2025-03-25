const { User } = require('../models'); // Import Sequelize model
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Add a new Admin or Employee (Only SuperAdmin)
const addUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!['admin', 'employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Only admin or employee can be added.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ name, email, password: hashedPassword, role });

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
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete the SuperAdmin.' });
        }

        await user.destroy();

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
        const currentSuperAdmin = await User.findOne({ where: { role: 'superadmin' } });
        const newSuperAdmin = await User.findByPk(id);

        if (!newSuperAdmin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        if (newSuperAdmin.role !== 'admin') {
            return res.status(400).json({ message: 'Only an admin can be promoted to SuperAdmin.' });
        }

        await currentSuperAdmin.update({ role: 'admin' });
        await newSuperAdmin.update({ role: 'superadmin' });

        res.status(200).json({ message: 'Admin promoted to SuperAdmin successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (Admins and Employees)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            where: { role: { [Op.ne]: 'superadmin' } }, 
            attributes: ['id', 'name', 'email', 'role']
        });

        res.status(200).json({ users });
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
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

// Promote an Employee to Admin (Only SuperAdmin)
const promoteEmployee = async (req, res) => {
    const { id } = req.params;
    const { user } = req; 

    try {
        if (user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden: Only SuperAdmin can promote employees.' });
        }

        const employee = await User.findByPk(id);
        if (!employee || employee.role !== 'employee') {
            return res.status(404).json({ message: 'Employee not found or not an employee.' });
        }

        await employee.update({ role: 'admin' });

        res.status(200).json({ message: 'Employee promoted to Admin successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id, {
            attributes: ['id', 'name', 'email', 'role']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching user' });
    }
};


module.exports = { addUser, deleteUser, promoteAdmin, getAllUsers, updateUser, promoteEmployee, getUserById };
