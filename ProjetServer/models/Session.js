// models/session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '7d' // Optional: Set session expiration (e.g., 7 days)
  }
});

module.exports = mongoose.model('Session', sessionSchema);
