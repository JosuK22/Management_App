const jwt = require('jsonwebtoken');
const { pool } = require('../app');
require('dotenv').config();

const roleMiddleware = (allowedRoles) => async (req, res, next) => {
  try {
    // Ensure user is authenticated
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Fetch user role from the database to ensure it is up to date
    const result = await pool.query('SELECT role FROM users WHERE id = $1', [decoded.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = result.rows[0].role;

    // Check if user role is allowed
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Role Middleware Error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

module.exports = roleMiddleware;
