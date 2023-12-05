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
