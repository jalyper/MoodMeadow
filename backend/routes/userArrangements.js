// routes/userArrangements.js
const express = require('express');
const router = express.Router();
const UserArrangement = require('../models/UserArrangement');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const userArrangements = await UserArrangement.find(!null);
    res.send(userArrangements);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

router.post('/save', auth, async (req, res) => {
  // Access req.user.id to get the user ID from the token
  try {
    const { sounds, isPrivate } = req.body;
    const userId = req.user.id; // Extracted by auth middleware

    // Create a new user arrangement
    const newArrangement = new UserArrangement({
      userId,
      sounds,
      isPrivate,
    });

    // Save the arrangement to the database
    await newArrangement.save();

    res.status(201).send(newArrangement);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

module.exports = router;
