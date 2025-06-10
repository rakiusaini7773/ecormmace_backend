const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Auto-create a default admin
async function createDefaultAdmin() {
  try {
    const existing = await Admin.findOne({ email: 'admin@site.com' });
    if (!existing) {
      const hashed = await bcrypt.hash('admin123', 10);
      await Admin.create({ email: 'admin@site.com', password: hashed, role: 'admin' });
      console.log('✅ Default admin created');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
}
createDefaultAdmin();

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

    res.status(201).json({ message: 'Admin created successfully', adminId: newAdmin._id, userRole: newAdmin.role });
  } catch (err) {
    console.error('Create Admin Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/login
exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      userId: admin._id, // ✅ Add user ID
      userRole: admin.role,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
