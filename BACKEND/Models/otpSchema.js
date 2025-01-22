const mongoose = require('mongoose');
const User = require('../Models/userSchema')

const otpSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true, 
        lowercase: true, 
      },
  otp: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true, // Ensure the password is hashed here
  },

  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Document will automatically be removed after 300 seconds (5 minutes)
  },
  used: {
    type: Boolean,
    default: false
  }
});

// Create a model from the schema
const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
