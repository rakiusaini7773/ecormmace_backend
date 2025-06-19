const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginHelper = async (Model, email, password, roleCheck = null) => {
  const user = await Model.findOne({ email });
  if (!user) return { error: 'User not found' };

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return { error: 'Invalid credentials' };

  if (roleCheck && user.role !== roleCheck) {
    return { error: 'Unauthorized access' };
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name || null,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage || null,
    }
  };
};

module.exports = loginHelper;
