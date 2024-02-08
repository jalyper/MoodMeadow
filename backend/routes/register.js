// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Login = require('../models/Login');
const router = express.Router();

router.get('/', async (req, res) => {
  res.send("Hello! You've reached Users endpoint!");
})

// Register route
router.post('/register', async (req, res) => {
  console.log('Registering new user:', req.body.email); // Log the attempt to register
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      console.log('Registration failed: User already exists', req.body.email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword
    });

    await user.save();
    console.log('User registered:', req.body.email); // Log the successful registration

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }
        console.log('JWT token created for user:', req.body.email);
        res.status(201).json({ token });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).send('Server error during registration');
  }
});

module.exports = router;
