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

module.exports = router;
