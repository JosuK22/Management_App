const bcrypt = require('bcryptjs');
const { User } = require('../models');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'Email does not exist.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000);

        await user.update({ reset_token: resetToken, reset_token_expiration: resetTokenExpiry });

        const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `<p>Click below to reset password:</p><a href="${resetLink}">Reset Password</a>`,
        });

        res.status(200).json({ message: 'Password reset link sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({ where: { reset_token: token } });

        if (!user || Date.now() > new Date(user.reset_token_expiration)) {
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await user.update({ password: hashedPassword, reset_token: null, reset_token_expiration: null });

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};

module.exports = { forgotPassword, resetPassword };
