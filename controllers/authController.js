const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');
const axios = require('axios');


// Funkcja rejestracji
exports.register = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const existingUser = await knex('users').where({ email }).first();
      if (existingUser) {
        return res.status(400).json({ message: 'Email już istnieje.' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await knex('users')
        .insert({ email, password: hashedPassword, provider: 'email' }) // provider ustawiony na 'email'
        .returning('*');
  
      res.status(201).json(newUser[0]);
    } catch (err) {
      res.status(500).json({ message: 'Błąd serwera', error: err });
    }
  };

  exports.facebookLogin = async (req, res) => {
    const { accessToken } = req.body;
  
    if (!accessToken) {
      return res.status(400).json({ message: 'Brakuje accessTokena' });
    }
  
    try {
      // Sprawdzenie access tokena i pobranie danych użytkownika
      const fbRes = await axios.get(`https://graph.facebook.com/me`, {
        params: {
          fields: 'id,email',
          access_token: accessToken,
        },
      });
  
      const { id, email } = fbRes.data;
  
      if (!email) {
        return res.status(400).json({ message: 'Brakuje adresu email z Facebooka' });
      }
  
      // Szukamy użytkownika po facebook_id
      let user = await knex('users').where({ facebook_id: id }).first();
  
      // Jeśli nie istnieje, tworzymy
      if (!user) {
        const inserted = await knex('users')
          .insert({
            email,
            facebook_id: id,
            provider: 'facebook',
          })
          .returning('*');
  
        user = inserted[0];
      }
  
      // Tworzymy token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      res.json({ token, user });
    } catch (err) {
      console.error('Błąd Facebook login:', err.response?.data || err.message);
      res.status(500).json({
        message: 'Błąd logowania przez Facebooka',
        error: err.response?.data || err.message,
      });
    }
  };

// Funkcja logowania
exports.loginSuccess = (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, user });
};
