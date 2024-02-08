// backend/routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const Login = require('../models/Login');
const router = express.Router();

router.get('/', async (req, res) => {
  res.send("Hello! You've reached Users endpoint!");
})

// Login route
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  console.log('Attempt to login:', usernameOrEmail); // Log the login attempt

  try {
    const isEmail = usernameOrEmail.includes('@');
    let user = isEmail
      ? await User.findOne({ email: usernameOrEmail })
      : await User.findOne({ username: usernameOrEmail });

    if (!user) {
      console.log('Login failed: Invalid credentials', usernameOrEmail);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Login failed: Password does not match', usernameOrEmail);
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      async (err, token) => {
        if (err) {
          console.error('Error signing token:', err);
          return res.status(500).json({ message: 'Error generating token' });
        }

        const loginRecord = new Login({
          identifier: usernameOrEmail,
          date: new Date()
        });

        try {
          await loginRecord.save();
          console.log('Login record saved for:', usernameOrEmail); // Log the saved login record
        } catch (saveError) {
          console.error('Error saving login record:', saveError);
          // Consider not failing the entire login process if only the record save fails
        }
        
        console.log('Successful login for:', usernameOrEmail);
        res.json({ token });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error during login');
  }
});

module.exports = router;
