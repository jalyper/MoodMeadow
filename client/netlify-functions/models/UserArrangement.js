// UserArrangement.js
const mongoose = require('mongoose');

const UserArrangementSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user model
    sounds: [{
        name: { type: String, required: true },
        src: { type: String, required: true }
    }],
    username: { type: String, require: true },
    date: { type: Date, default: Date.now }, // Sets the default date to the current date/time
    isPrivate: { type: Boolean, require: true, default: false }, // Sets the default to not private
    totalSaves: { type: Number, require: true, default: 0 },
    originalArrangementId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserArrangement' }
});

module.exports = mongoose.models.UserArrangement || mongoose.model('UserArrangement', UserArrangementSchema, 'userArrangements');