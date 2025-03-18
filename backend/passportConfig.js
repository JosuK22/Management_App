// backend/passportConfig.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

let pool; // Declare pool here

// Function to initialize passport strategies
function initializePassport(dbPool) {
  pool = dbPool; // Set pool value

  // Local Strategy (email/password login)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          if (!pool) {
            return done(new Error("Database connection is undefined"), false);
          }
          const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = userResult.rows[0];
          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

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
          const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [jwtPayload.userId]);
          const user = userResult.rows[0];
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
