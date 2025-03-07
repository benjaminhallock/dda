const { randomUUID } = require('crypto');

const User = require('../models/User.js');
const { Wallet } = require('../models/models.js');
const { generatePasswordHash, validatePassword } = require('../utils/password.js');

class UserService {
  static async list(filter = {}, limit = 100, skip = 0) {
    try {
      return User.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .select('-password -refreshToken');
    } catch (err) {
      throw new Error(`Database error while listing users: ${err}`);
    }
  }

  static async get(id) {
    try {
      return User.findOne({ _id: id }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their ID: ${err}`);
    }
  }

  static async getByEmail(email) {
    try {
      return User.findOne({ email }).exec();
    } catch (err) {
      throw new Error(`Database error while getting the user by their email: ${err}`);
    }
  }

  static async update(id, data) {
    try {
      // Remove sensitive fields that shouldn't be updated directly
      const { password, refreshToken, ...updateData } = data;
      
      return User.findOneAndUpdate({ _id: id }, updateData, { new: true, upsert: false })
        .select('-password -refreshToken');
    } catch (err) {
      throw new Error(`Database error while updating user ${id}: ${err}`);
    }
  }

  static async delete(id) {
    try {
      const result = await User.deleteOne({ _id: id }).exec();
      return (result.deletedCount === 1);
    } catch (err) {
      throw new Error(`Database error while deleting user ${id}: ${err}`);
    }
  }

  static async authenticateWithPassword(email, password) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    try {
      const user = await User.findOne({email}).exec();
      if (!user) return null;

      const passwordValid = await validatePassword(password, user.password);
      if (!passwordValid) return null;

      user.lastLoginAt = Date.now();
      const updatedUser = await user.save();
      return updatedUser;
    } catch (err) {
      throw new Error(`Database error while authenticating user ${email} with password: ${err}`);
    }
  }

  static async create({ email, password, name = '', role = 'worker' }) {
    if (!email) throw new Error('Email is required');
    if (!password) throw new Error('Password is required');

    const existingUser = await UserService.getByEmail(email);
    if (existingUser) throw new Error('User with this email already exists');

    const hash = await generatePasswordHash(password);

    try {
      const user = new User({
        email,
        password: hash,
        name,
        role,
      });

      await user.save();
      
      // Create a wallet for the new user
      const wallet = new Wallet({
        user: user._id,
        balance: {
          btc: "0",
          usd: 0
        }
      });
      
      await wallet.save();
      
      return user;
    } catch (err) {
      throw new Error(`Database error while creating new user: ${err}`);
    }
  }

  static async setPassword(user, password) {
    if (!password) throw new Error('Password is required');
    user.password = await generatePasswordHash(password); // eslint-disable-line

    try {
      if (!user.isNew) {
        await user.save();
      }

      return user;
    } catch (err) {
      throw new Error(`Database error while setting user password: ${err}`);
    }
  }
  
  static async validateEmail(id) {
    try {
      return User.findByIdAndUpdate(id, { isEmailValidated: true }, { new: true })
        .select('-password -refreshToken');
    } catch (err) {
      throw new Error(`Database error while validating email: ${err}`);
    }
  }
  
  static async updateRefreshToken(id, token) {
    try {
      return User.findByIdAndUpdate(id, { refreshToken: token }, { new: true });
    } catch (err) {
      throw new Error(`Database error while updating refresh token: ${err}`);
    }
  }
}

module.exports = UserService;
