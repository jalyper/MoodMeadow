// backend/routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // You'll create this model next
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  // ... register logic here
});

// Login route
router.post('/login', async (req, res) => {
  // ... login logic here
});

module.exports = router;
