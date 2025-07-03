const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const loginHelper = require('../utils/loginHelper');

// Register User
const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, phonenumber, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, phonenumber, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phonenumber: newUser.phonenumber,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginHelper(User, email, password, 'user');

    if (result.error) return res.status(401).json({ message: result.error });

    res.status(200).json(result);
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ➕ Add new address
// ➕ Add new address
const addUserAddress = async (req, res) => {
  const userId = req.user.id;

  const {
    firstName,
    lastName,
    company,
    address,        // → addressLine1
    apartment,      // → addressLine2
    city,
    state,          // → province
    country,
    zip,            // → zipCode
    phone,
    isDefault
  } = req.body;

  const newAddress = {
    firstName,
    lastName,
    company,
    addressLine1: address,
    addressLine2: apartment,
    city,
    province: state,
    country,
    zipCode: zip,
    phone,
    isDefault: isDefault || false
  };

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Clear previous default if this one is default
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({
      message: 'Address added successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    console.error('Add Address Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


// 📦 Get all user addresses
const getUserAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  addUserAddress,
  getUserAddresses,
};
