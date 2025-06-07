const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function createAdmin() {
  const existing = await Admin.findOne({ email: 'admin@site.com' });
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Admin.create({ email: 'admin@site.com', password: hashed });
    console.log('Admin created');
  }
}
createAdmin();

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin) return res.status(404).json({ message: 'Admin not found' });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token });
};