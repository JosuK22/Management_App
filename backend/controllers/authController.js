const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../app');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Forgot Password function
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Email does not exist.' });
    }

    // Generate reset token (using crypto for security)
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Get current time and add 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // Adds 1 hour to current date/time and converts to ISO string

    // Store the reset token and expiry in the DB
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiration = $2 WHERE email = $3',
      [resetToken, resetTokenExpiry, email]
    );

    // Send the reset password email to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services or configure SMTP settings as needed
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password function
const resetPassword = async (req, res) => {
  const { token } = req.params; // Retrieve the token from the URL
  const { password } = req.body; // New password from the request body

  try {
    // Fetch user by the reset token
    const userResult = await pool.query('SELECT * FROM users WHERE reset_token = $1', [token]);
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    if (Date.now() > new Date(user.reset_token_expiration).getTime()) {
      return res.status(400).json({ message: 'Reset token has expired.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password and clear the reset token fields
    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiration = NULL WHERE reset_token = $2',
      [hashedPassword, token]
    );

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

module.exports = { forgotPassword, resetPassword };
