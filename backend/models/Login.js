// backend/models/Login.js
const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema({
  identifier: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Login', loginSchema, 'logins');
