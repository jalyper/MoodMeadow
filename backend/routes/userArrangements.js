// routes/userArrangements.js
const express = require('express');
const router = express.Router();
const UserArrangement = require('../models/UserArrangement');

router.post('/save', async (req, res) => {
  try {
    const { userId, sounds } = req.body;

    // Create a new user arrangement
    const newArrangement = new UserArrangement({
      userId, // You need to have authenticated the user and have their ID
      sounds,
    });

    // Save the arrangement to the database
    await newArrangement.save();

    res.status(201).send(newArrangement);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
