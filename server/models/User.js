const mongoose = require('mongoose');

const { validatePassword, isPasswordHash } = require('../utils/password.js');
const {randomUUID} = require("crypto");

const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    validate: { validator: isPasswordHash, message: 'Invalid password hash' },
  },
  name: {
    type: String,
    default: '',
  },
  role: {
    type: String,
    enum: ['worker', 'employer', 'admin'],
    default: 'worker',
  },
  isEmailValidated: {
    type: Boolean,
    default: false,
  },
  profile: {
    avatar: String,
    bio: String,
    location: String,
    skills: [String],
    hourlyRate: {
      btc: String,
      usd: Number
    }
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'busy'],
    default: 'offline',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  lastLoginAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  refreshToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
    default: null,
  },
}, {
  versionKey: false,
});

schema.set('toJSON', {
  /* eslint-disable */
  transform: (doc, ret, options) => {
    delete ret.password;
    return ret;
  },
  /* eslint-enable */
});

const User = mongoose.model('User', schema);

module.exports = User;
