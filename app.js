const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./config/passport')(passport);

const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
  }));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});