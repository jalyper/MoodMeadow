const express = require('express');
const router = express.Router();
const UserLibrary = require('../models/UserLibrary'); // Use the UserLibrary model
const UserArrangement = require('../models/UserArrangement'); // Use the UserLibrary model
const auth = require('../middleware/auth');
const User = require('../models/User');

// You can keep the GET routes similar to fetch libraries instead of arrangements if needed

router.get('/:userId', auth, async (req, res) => {
  const { userId } = req.params;
  console.log('userId:', userId);

  try {
    // Find the library associated with the userId
    const userLibrary = await UserLibrary.findOne({ userId: userId });
    console.log('userLibrary:', userLibrary);
    
    // If no userLibrary is found, return a 404 or an empty object/array as you see fit
    if (!userLibrary) {
      return res.status(404).json({ message: 'Library not found' });
    }

    // If a userLibrary is found, return it
    res.status(200).json(userLibrary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Find the library associated with the userId
      const userLibrary = await UserLibrary.findOne({ userId: userId });
  
      // If no userLibrary is found, return a 404 or an empty object/array as you see fit
      if (!userLibrary) {
        return res.status(404).json({ message: 'Library not found' });
      }
  
      // If a userLibrary is found, return it
      res.status(200).json(userLibrary);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.post('/save', auth, async (req, res) => {
  const userId = req.user.id;

  try {
    console.log(req.body);
    const { arrangement } = req.body; // This should be the entire arrangement object

    // Make sure arrangement is an object, sounds is an array, and every sound has a name and src
    if (typeof arrangement !== 'object' || 
        !Array.isArray(arrangement.sounds) || 
        !arrangement.sounds.every(sound => sound && sound.name && sound.src)) {
            return res.status(400).json({ message: 'Invalid arrangement data.' });
    }

    // Find the user library or create a new one if it doesn't exist
    let userLibrary = await UserLibrary.findOne({ userId: userId });

    if (!userLibrary) {
      userLibrary = new UserLibrary({
        userId,
        arrangements: []
      });
    }

    // Check if the arrangement already exists in the user's library
    const doesArrangementExist = userLibrary.arrangements.some(existingArrangement => {
      return JSON.stringify(existingArrangement.sounds) === JSON.stringify(arrangement.sounds);
    });

    if (doesArrangementExist) {
      return res.status(409).json({ message: 'Arrangement already exists in library' });
    }

    // Add the new arrangement to the user's library
    userLibrary.arrangements.push(arrangement);

    // Save the updated or new user library to the database
    await userLibrary.save();

    // Find the UserArrangement object by its ID and increment the totalSaves property
    if (arrangement._id) {
      const userArrangement = await UserArrangement.findById(arrangement._id);
      if (userArrangement) {
        userArrangement.totalSaves += 1;
        await userArrangement.save();
      }
    }

    res.status(201).json(userLibrary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:userId/arrangements/:arrangementId', auth, async (req, res) => {
  const { userId, arrangementId } = req.params;

  try {
    // Find the user's library
    const userLibrary = await UserLibrary.findOne({ userId: userId });

    // If no userLibrary is found, return a 404
    if (!userLibrary) {
      return res.status(404).json({ message: 'Library not found' });
    }


    // Save the updated user library to the database
    console.log('userLibrary:', userLibrary);
    console.log('Is arrangements an array: ', Array.isArray(userLibrary.arrangements));
    console.log('Does arrangements have the deleted arrangement: ', userLibrary.arrangements.some(arrangement => arrangement._id.toString() === arrangementId));
    
    // Remove the arrangement from the user's library
    userLibrary.arrangements = userLibrary.arrangements.filter(arrangement => arrangement._id.toString() !== arrangementId);
    await userLibrary.save();

    res.status(200).json(userLibrary);
  } catch (error) {
    console.log('Error:', error); // Add this line
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
