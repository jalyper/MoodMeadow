const mongoose = require('mongoose');

const UserLibrarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  arrangements: [{
    sounds: [{
      name: { type: String, required: true },
      src: { type: String, required: true }
    }],
    // include any other properties that an arrangement might have
  }],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserLibrary', UserLibrarySchema, 'userLibraries');
