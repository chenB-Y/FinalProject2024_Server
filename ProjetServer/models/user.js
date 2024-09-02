const mongoose = require('mongoose');
const boxSchema = require("./boxes");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  buildingAddress: {
    type: String,
  },
  city: {
    type: String,
  },
  devicesCount: {
    type: Number,
  },
  floorsCount: { 
    type: Number,
  },
  profileImage: {
    type: String,
  },
  boardImage: {
    type: String,
  },
  boxes: [{
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }],
  backgroundColor: {
    type: String, // Store color as an integer
  },
  
  messages: [
    {
        text: { type: String, default: '' },
        color: { type: String, default: 'black' } // default color if not provided
    }
  ],

  phoneSize:[
    {
      inches:{type: Number},
      width:{type: Number},
      height:{type: Number}
    }
  ],

  template:{
    type:String
  },

  api: {
    type: [String],
    validate: [arrayLimit, '{PATH} exceeds the limit of 2'],
    default: [null, null] // Default to [null, null] if not specified
  },

  updatePending:{
    type: Boolean
  },
  
  logOutTV:{
    type: Boolean
  },

});

function arrayLimit(val) {
  return val.length <= 2;
}

const User = mongoose.model('User', userSchema);

module.exports = User;
