require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/database');
require('./config/passport');

const app = express();

initializeDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || true,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hackathon_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 604800000,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/products', require('./routes/products'));
app.use('/boats', require('./routes/boats'));
app.use('/bookings', require('./routes/bookings'));
app.use('/forum', require('./routes/forum'));

app.use((err, req, res, next) => {
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 3482;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
