// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const router = express.Router();

router.get('/', async (req, res) => {
  res.send("Hello! You've reached Users endpoint!");
})

// Register route
router.post('/register', async (req, res) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    // Save the user
    await user.save();

    // Create and return the JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure to have JWT_SECRET in your .env file
      { expiresIn: '1h' }, // Token expires in one hour
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    // Retrieve user from the database
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // User matched, create and assign a token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Make sure to have JWT_SECRET in your .env file
      { expiresIn: 3600 }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send the token to the client
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
