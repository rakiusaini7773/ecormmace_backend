const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const loginHelper = require('../utils/loginHelper');

// Auto-create a default admin
async function createDefaultAdmin() {
  try {
    const existing = await Admin.findOne({ email: 'admin@site.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await Admin.create({
        email: 'admin@site.com',
        password: hashed,
        role: 'admin',
      });
      console.log('✅ Default admin created');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}
exports.createDefaultAdmin = createDefaultAdmin;

// POST /api/admin/create
exports.createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const existing = await Admin.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Admin already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ email, password: hashed, role: 'admin' });

    res.status(201).json({
      message: 'Admin created successfully',
      adminId: newAdmin._id,
      userRole: newAdmin.role,
    });
  } catch (err) {
    console.error('Create Admin Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginHelper(Admin, email, password, 'admin');

    if (result.error) return res.status(401).json({ message: result.error });

    res.status(200).json({
      ...result,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
