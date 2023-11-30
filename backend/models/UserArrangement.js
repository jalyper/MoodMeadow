// models/UserArrangement.js
const mongoose = require('mongoose');

const UserArrangementSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, // Reference to the user
  sounds: [String], // Array of sound names or IDs
  // Include other properties as needed
});

module.exports = mongoose.model('UserArrangement', UserArrangementSchema);
