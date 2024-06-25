const express = require('express');
const router = express.Router();
const UserLibrary = require('../models/UserLibrary');
const UserArrangement = require('../models/UserArrangement');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

router.get('/', auth, async (req, res) => {
  try {
    const userLibrary = await UserLibrary.findOne({ userId: req.user.id });
    if (!userLibrary) {
      return res.status(404).json({ message: 'Library not found' });
    }
    res.status(200).json(userLibrary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/save', auth, async (req, res) => {
  try {
    const { arrangement } = req.body;

    if (typeof arrangement !== 'object' || 
        !Array.isArray(arrangement.sounds) || 
        !arrangement.sounds.every(sound => sound && sound.name && sound.src)) {
      return res.status(400).json({ message: 'Invalid arrangement data.' });
    }

    let userLibrary = await UserLibrary.findOne({ userId: req.user.id });

    if (!userLibrary) {
      userLibrary = new UserLibrary({
        userId: req.user.id,
        arrangements: []
      });
    }

    const doesArrangementExist = userLibrary.arrangements.some(existingArrangement => 
      JSON.stringify(existingArrangement.sounds) === JSON.stringify(arrangement.sounds)
    );

    if (doesArrangementExist) {
      return res.status(409).json({ message: 'Arrangement already exists in library' });
    }

    if (arrangement._id) {
      await UserArrangement.findByIdAndUpdate(arrangement._id, { $inc: { totalSaves: 1 } });
    }

    userLibrary.arrangements.push(arrangement);
    await userLibrary.save();

    res.status(201).json(userLibrary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/arrangements/:arrangementId', auth, async (req, res) => {
  const { arrangementId } = req.params;

  try {
    const userLibrary = await UserLibrary.findOne({ userId: req.user.id });

    if (!userLibrary) {
      return res.status(404).json({ message: 'Library not found' });
    }

    userLibrary.arrangements = userLibrary.arrangements.filter(
      arrangement => arrangement._id.toString() !== arrangementId
    );
    
    await userLibrary.save();

    res.status(200).json(userLibrary);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;