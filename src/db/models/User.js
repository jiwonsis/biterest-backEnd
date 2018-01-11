const mongoose = require('mongoose');
const { Schema } = mongoose;
const { PASSWORD_HASH_KEY: secret } = process.env;
const crypto = require('crypto');
const token = require('lib/token');

function hash(password) {
  return crypto.createHmac('sha256', secret).update(password).digest('hex');
}

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
  },
  metaInfo: {
    activated: Boolean
  }
});

User.statics.findByEmail = function(email) {
  return this.findOne({email}).exec();
};

User.statics.findByDisplayName = function(displayName) {
  return this.findOne({displayName}).exec();
};

User.statics.findExistancy = function({email, displayName}) {
  return this.findOne({
    $or: [
      {email},
      {displayName}
    ]
  }).exec();
};

User.statics.localRegister = function({ 
  displayName, email, password
}) {
  const user = new this({
    displayName,
    email,
    password: hash(password)
  });
  return user.save();
};

User.methods.validatePassword = function(password) {
  const hashed = hash(password);
  console.log('hash: %s, pw: %s', hashed, this.password);
  return this.password === hashed;
};

User.methods.generateToken = function() {
  const { _id, displayName } = this;
  return token.generateToken({
    user: {
      _id,
      displayName
    }
  }, 'user');
};

module.exports = mongoose.model('User', User);