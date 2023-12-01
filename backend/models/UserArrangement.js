// models/UserArrangement.js
const mongoose = require('mongoose');

const UserArrangementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user model
  sounds: { type: [String], require: true }, // Array of sound names or IDs
  userName: { type: String, require: true },
  date: { type: Date, default: Date.now }, // Sets the default date to the current date/time
  isPrivate: { type: Boolean, default: false } // Sets the default to not private
  // Include other properties as needed
});

module.exports = mongoose.model('UserArrangement', UserArrangementSchema, 'userArrangements');
