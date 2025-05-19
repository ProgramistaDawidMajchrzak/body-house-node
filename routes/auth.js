const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

router.post('/register', authController.register);

router.post('/login', passport.authenticate('local', {
  session: false,
}), authController.loginSuccess);

router.post('/facebook', authController.facebookLogin);

router.post('/google', authController.googleLogin);

module.exports = router;
