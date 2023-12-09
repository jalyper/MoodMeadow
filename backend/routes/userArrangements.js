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
  const userId = req.user.id; 

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { sounds, isPrivate, originalArrangementId } = req.body;

    if (!sounds.every(sound => sound && sound.name && sound.src)) {
      return res.status(400).json({ message: 'Each sound must have a name and a source.' });
    }

    let totalSavesIncremented = false;
    if (originalArrangementId) {
      // Find and update the original arrangement
      const originalArrangement = await UserArrangement.findById(originalArrangementId);
      if (originalArrangement) {
        originalArrangement.totalSaves += 1;
        await originalArrangement.save();
        totalSavesIncremented = true;
      }
    }

    // Create a new user arrangement
    const newArrangement = new UserArrangement({
      userId,
      username: user.username,
      sounds,
      isPrivate,
      originalArrangementId: totalSavesIncremented ? originalArrangementId : undefined
    });

    await newArrangement.save();
    res.status(201).json(newArrangement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
