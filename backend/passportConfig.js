const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { User } = require('./models'); // Import Sequelize User model
dotenv.config();

// Function to initialize passport strategies
function initializePassport() {
  // Local Strategy (email/password login)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find user by email using Sequelize
          const user = await User.findOne({ where: { email } });

          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy for token-based authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      async (jwtPayload, done) => {
        try {
          // Find user by ID using Sequelize
          const user = await User.findByPk(jwtPayload.userId);

          if (!user) {
            return done(null, false, { message: 'User not found' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = { passport, initializePassport };
