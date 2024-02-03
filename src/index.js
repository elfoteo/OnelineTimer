// index.js

const express = require('express');
const app = express();
const SECRET_KEY = require('./utils/constants');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
      return res.status(401).send('Access denied. No token provided.');
  }

  try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = decoded;
      next();
  } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(400).send('Invalid token.');
  }
};

// Routes
app.use('/auth', authRoutes);

// Root route handler
app.get('/', (req, res) => {
  res.render('index');
});

// Render register page
app.get('/register', (req, res) => {
  res.render('register'); // Renders register.ejs from the views directory
});

// Render login page
app.get('/login', (req, res) => {
  res.render('login', {registered: req.query.registered}); // Renders login.ejs from the views directory
});

// Render timer page
app.get('/timer', (req, res) => {
    // Assuming you have some logic to calculate the timer value
    const timerValue = "00:10:30"; // Example timer value
    
    // Render the timer view and pass the timerValue variable
    res.render('timer', { timerValue }); // Renders timer.ejs from the views directory
});

// Render guestTimer view for not logged-in users
app.get('/guestTimer', (req, res) => {
    res.render('guestTimer');
});

// Render dashboard view for logged-in users
app.get('/dashboard', verifyToken, (req, res) => {
  res.render('dashboard');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
