// routes/userArrangements.js
const express = require('express');
const router = express.Router();
const UserArrangement = require('../models/UserArrangement');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const userArrangements = await UserArrangement.find(!null);
    res.send(userArrangements);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
})

router.get('/public-arrangements', async (req, res) => {
  try {
    const arrangements = await UserArrangement.find({ isPrivate: false })
      .populate('userId', 'username') 
      .sort({ date: -1 }); // Sorting by date for example, newest first
    res.send(arrangements);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post('/save', auth, async (req, res) => {
  // Extracted by auth middleware
  const userId = req.user.id; 

  try {
    // Find the user by ID and get the username
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { sounds, isPrivate, originalArrangementId } = req.body;

    // Create a new user arrangement with the username from the user document
    const newArrangement = new UserArrangement({
      userId,
      username: user.username, // Add the username here
      sounds,
      isPrivate,
      totalSaves: originalArrangementId ? 1 : 0,
      // Set originalArrangementId if it's a save of another arrangement
      originalArrangementId: originalArrangementId || undefined
    });

    // Save the arrangement to the database
    await newArrangement.save();
    res.status(201).json(newArrangement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
