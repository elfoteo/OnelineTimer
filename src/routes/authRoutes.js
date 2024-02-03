// authRoutes.js

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const SECRET_KEY = require('../utils/constants');

// Define path to the JSON file
const dataFilePath = path.join(__dirname, '..', 'data.json');

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
      password: hashedPassword
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

module.exports = router;
