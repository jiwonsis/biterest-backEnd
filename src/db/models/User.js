const mongoose = require('mongoose');
const { Schema } = mongoose;

const User = new Schema({
  displayName: String,
  email: String,
  social: {
    facebook: {
      id: String,
      accessToken: String
    },
    google: {
      id: String,
      accessToken: String
    }
  },
  password: String,
  createAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.Model('User', User);