const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Rejestracja - sprawdź, czy authController.register to funkcja!
router.post('/register', authController.register);

// Logowanie
router.post('/login', passport.authenticate('local', {
  session: false,
}), authController.loginSuccess);

// GOOGLE
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.loginSuccess
);

// FACEBOOK
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  authController.loginSuccess
);

module.exports = router;
