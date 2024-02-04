// authRoutes.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/verifyToken');
const {SECRET_KEY, dataFilePath} = require('../utils/constants.js')

// Helper function to read data from the JSON file
const readDataFromFile = () => {
  try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
  } catch (error) {
    return []; // Return empty array if file doesn't exist or is empty
  }
};

// Define writeDataToFile function
const writeDataToFile = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  };

// Register route
router.post('/register', async (req, res) => {
  // Read existing users data from the JSON file
  let users = readDataFromFile();

  // Check if the username is already taken
  if (users.some(user => user.username === req.body.username)) {
      return res.render('register', {registrationFailure: true});
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10); // 10 is the salt rounds

  // Add the new user with hashed password to the array
  users.push({
      username: req.body.username,
      password: hashedPassword,
      timers: []
  });

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.render('login', {registered: true});
});
  

// Login route
router.post('/login', async (req, res) => {
    // Read existing users data from the JSON file
    let users = readDataFromFile();

    // Find the user by username
    let user = users.find(u => u.username === req.body.username);
    if (!user) {
        return res.render('login', {loginFailure: true});
    }

    // Compare the hashed password
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (passwordMatch) {
        // Generate JWT token
        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        // Set the token as a cookie
        res.cookie('token', token, { httpOnly: true });
        
        // Redirect to dashboard
        return res.redirect('/dashboard');
    } else {
        return res.render('login', {loginFailure: true});
    }
});

// Route to create a new timer for a user
router.post('/addTimer', verifyToken, (req, res) => {
  const { name, duration } = req.body;
  const { username } = req.user;

  // Read existing users data from the JSON file
  let users = readDataFromFile();

  // Find the user by username
  const userIndex = users.findIndex((user) => user.username === username);

  if (userIndex === -1) {
    return res.status(404).send('User not found');
  }

  // Generate unique ID for the new timer
  const timerId = Math.floor(Math.random() * 1000);

  // Create the new timer object
  const newTimer = {
    id: timerId,
    name: name || `Timer ${timerId}`,
    duration: duration || { hours: 0, minutes: 0, seconds: 0 },
    paused: false,
    started: false,
    elapsedTime: { hours: 0, minutes: 0, seconds: 0 },
    timerAddedDate: Date.now()
  };

  // Add the new timer to the user's timers array
  users[userIndex].timers.push(newTimer);

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.status(201).send('Timer created successfully');
});
// Route to pause a timer for a user
router.put('/pauseTimer/:timerId', verifyToken, (req, res) => {
  const timerId = parseInt(req.params.timerId); // Convert timerId to integer
  const { username } = req.user;

  // Read user data from JSON file
  let users = readDataFromFile();
  
  // Find the user object in userData array
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Find the timer object with the given timerId
  const timer = user.timers.find(timer => timer.id === timerId);

  if (!timer) {
    return res.status(404).send('Timer not found');
  }

  // Pause the timer
  if (!timer.paused) {
    timer.paused = true;
    timer.pauseStartTime = Date.now(); // Store the current time when pausing
  }

  // Calculate the elapsed time before pausing
  const elapsedBeforePausing = Date.now() - timer.timerAddedDate;
  // Add the elapsed time before pausing to the total elapsed time
  timer.elapsedTime.seconds += Math.floor(elapsedBeforePausing / 1000) % 60;
  timer.elapsedTime.minutes += Math.floor(elapsedBeforePausing / 60000) % 60;
  timer.elapsedTime.hours += Math.floor(elapsedBeforePausing / 3600000);
  // Adjust the elapsed time
  if (timer.elapsedTime.seconds >= 60) {
    timer.elapsedTime.minutes += Math.floor(timer.elapsedTime.seconds / 60);
    timer.elapsedTime.seconds %= 60;
  }
  if (timer.elapsedTime.minutes >= 60) {
    timer.elapsedTime.hours += Math.floor(timer.elapsedTime.minutes / 60);
    timer.elapsedTime.minutes %= 60;
  }

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.status(200).send('Timer paused successfully');
});

// Route to resume a timer for a user
router.put('/resumeTimer/:timerId', verifyToken, (req, res) => {
  const timerId = parseInt(req.params.timerId); // Convert timerId to integer
  const { username } = req.user;

  // Read user data from JSON file
  let users = readDataFromFile();
  
  // Find the user object in userData array
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Find the timer object with the given timerId
  const timer = user.timers.find(timer => timer.id === timerId);

  if (!timer) {
    return res.status(404).send('Timer not found');
  }

  // Resume the timer
  if (timer.paused) {
    timer.paused = false;
    // Store the elapsed time before resuming
    timer.timerAddedDate = Date.now();
  }

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.status(200).send('Timer resumed successfully');
});


// Route to start a timer for a user
router.put('/startTimer/:timerId', verifyToken, (req, res) => {
  const timerId = parseInt(req.params.timerId); // Convert timerId to integer
  const { username } = req.user;

  // Read user data from JSON file
  let users = readDataFromFile();
  
  // Find the user object in userData array
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Find the timer object with the given timerId
  const timer = user.timers.find(timer => timer.id === timerId);

  if (!timer) {
    return res.status(404).send('Timer not found');
  }

  // Start the timer
  timer.started = true;

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.status(200).send('Timer paused successfully');
});

// Route to stop a timer for a user
router.put('/stopTimer/:timerId', verifyToken, (req, res) => {
  const timerId = parseInt(req.params.timerId); // Convert timerId to integer
  const { username } = req.user;

  // Read user data from JSON file
  let users = readDataFromFile();
  
  // Find the user object in userData array
  const user = users.find(user => user.username === username);
  
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Find the timer object with the given timerId
  const timer = user.timers.find(timer => timer.id === timerId);

  if (!timer) {
    return res.status(404).send('Timer not found');
  }

  // Stop the timer
  timer.started = false;

  // Write the updated users data back to the JSON file
  writeDataToFile(users);

  res.status(200).send('Timer resumed successfully');
});

module.exports = router;
