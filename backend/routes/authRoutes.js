const express = require('express');
const passport = require('passport');
const { signup, forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();

// POST Login using Passport Local Strategy
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const jwt = require('jsonwebtoken');
  
  // JWT Token creation after successful authentication
  const token = jwt.sign(
    { userId: req.user.id, email: req.user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(200).json({
    message: 'success',
    data: {
      info: { email: req.user.email, name: req.user.name, _id: req.user.id },
      token,
    },
  });
});


// POST Forgot Password
router.post('/forgot-password', forgotPassword);

// POST Reset Password
router.post('/reset-password/:token', resetPassword);



module.exports = router;
