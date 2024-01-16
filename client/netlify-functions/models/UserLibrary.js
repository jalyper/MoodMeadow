// UserLibrary.js
const mongoose = require('mongoose');

const SoundSchema = new mongoose.Schema({
    name: { type: String, required: true },
    src: { type: String, required: true }
});

const ArrangementSchema = new mongoose.Schema({
    sounds: [SoundSchema],
    // include any other properties that an arrangement might have
});

const UserLibrarySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    arrangements: [ArrangementSchema],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.models.UserLibrary || mongoose.model('UserLibrary', UserLibrarySchema, 'userLibraries');