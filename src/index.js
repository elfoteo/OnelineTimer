// index.js

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const User = require('./models/User'); // Import the User model
const Timer = require('./models/Timer'); // Import the Timer model
const verifyToken = require('./utils/verifyToken');
const authRoutes = require('./routes/authRoutes');
const path = require('path');
const {SECRET_KEY, dataFilePath} = require('./utils/constants.js')
const fs = require('fs');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

// Helper function to read user data from JSON file
const readUserData = () => {
  try {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
  } catch (error) {
      console.error('Error reading user data:', error);
      return [];
  }
};

// Define writeDataToFile function
const writeDataToFile = (data) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
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

// Render fullscreen view with timer id and username
app.get('/fullscreen/:username/:timerId', (req, res) => {
  const timerId = parseInt(req.params.timerId); // Convert timerId to integer
  const username = req.params.username;

  let decoded;
  try{
    const token = req.cookies.token;
    decoded = jwt.verify(token, SECRET_KEY);
  }
  catch {
    decoded = {username: undefined}
  }
  const isOwner = username == decoded.username;

  // Read user data from JSON file
  const userData = readUserData();
  
  // Find the user object in userData array
  const user = userData.find(user => user.username === username);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Find the timer object with the given timerId
  const timer = user.timers.find(timer => timer.id === timerId);

  if (!timer) {
    return res.status(404).send('Timer not found');
  }

  // Render the fullscreen view and pass the timer object and user
  res.render('fullscreen', { timer, user, isOwner });
});



// Render dashboard view for logged-in users
app.get('/dashboard', verifyToken, (req, res) => {
  // Retrieve username from token
  const username = req.user.username;

  // Read user data from JSON file
  const userData = readUserData();

  // Find the user object in userData array
  const user = userData.find(user => user.username === username);

  if (!user) {
      return res.status(404).send('User not found');
  }

  // Pass the user object to the dashboard view
  res.render('dashboard', { user });
});

// Define a route to handle the removal of a timer
app.delete('/removeTimer/:timerId', verifyToken, (req, res) => {
  const username = req.user.username;
  const timerId = req.params.timerId;

  // Read user data from JSON file
  let userData = readUserData();

  // Find the user by username
  const userIndex = userData.findIndex(user => user.username === username);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  // Find the timer to remove by its id
  const timerIndex = userData[userIndex].timers.findIndex(timer => timer.id === parseInt(timerId));

  if (timerIndex === -1) {
    return res.status(404).send('Timer not found');
  }

  // Remove the timer from the user's timers array
  userData[userIndex].timers.splice(timerIndex, 1);

  // Write the updated user data back to the JSON file
  writeDataToFile(userData)

  res.status(200).send('Timer removed successfully');
});

// Define route to serve JSON data for dashboard
app.get('/dashboard-json', verifyToken, (req, res) => {
  // Retrieve username from token
  const username = req.user.username;

  // Read user data from JSON file
  const userData = readUserData();

  // Find the user object in userData array
  const user = userData.find(user => user.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Send the user object as JSON response
  res.json(user);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
