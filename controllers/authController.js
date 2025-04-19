const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const knex = require('../db/knex');

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

// Funkcja logowania
exports.loginSuccess = (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.json({ token, user });
};
