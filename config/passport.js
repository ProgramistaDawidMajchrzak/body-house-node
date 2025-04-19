// config/passport.js
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');
const knex = require('../db/knex'); // lub gdziekolwiek masz `knex` skonfigurowany

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await knex('users').where({ email }).first();
          if (!user) {
            return done(null, false, { message: 'Nieprawidłowy email' });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: 'Nieprawidłowe hasło' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await knex('users').where({ google_id: profile.id }).first();
      if (!user) {
        const [newUser] = await knex('users')
          .insert({
            email: profile.emails[0].value,
            google_id: profile.id,
            provider: 'google',
          })
          .returning('*');
        return done(null, newUser);
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/api/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name'] // ważne! email nie jest domyślnie zwracany
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0]?.value;
      const facebookId = profile.id;

      let user = await knex('users').where({ facebook_id: facebookId }).first();

      // Jeśli użytkownik z takim facebook_id nie istnieje – szukaj po emailu
      if (!user && email) {
        user = await knex('users').where({ email }).first();

        if (user) {
          // Uzupełnij konto o facebook_id
          await knex('users')
            .where({ id: user.id })
            .update({ facebook_id: facebookId });
        }
      }

      // Jeśli nadal nie istnieje – tworzymy
      if (!user) {
        const [newUser] = await knex('users')
          .insert({
            email: email || null,
            facebook_id: facebookId,
            provider: 'facebook'
          })
          .returning('*');
        return done(null, newUser);
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await knex('users').where({ id }).first();
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};
