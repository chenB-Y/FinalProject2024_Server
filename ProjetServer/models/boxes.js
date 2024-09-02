// models/session.js
const mongoose = require('mongoose');

const boxes = new mongoose.Schema({
  x: {
    type: Number,
  },
  y: {
    type: Number,
  },
  width: {
    type: Number,
  },
  height: {
    type: Number,
  },
  backgroundColor: {
    type: Number, // Store color as an integer
    default: 0 // Default to 0 or any other default color value
  }
});

module.exports = mongoose.model('boxes', boxes);
