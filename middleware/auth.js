const jwt = require('jsonwebtoken');

// 🔐 Verify JWT and attach user info
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // decoded = { id, role, ... }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token", error: error.message });
  }
};

// ✅ Role check: Admin only
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ✅ Role check: User only
const verifyUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Users only." });
  }
  next();
};

// ✅ Combined middlewares for routes
const verifyTokenAndAdmin = [verifyToken, verifyAdmin];
const verifyTokenAndUser = [verifyToken, verifyUser];

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyUser,
  verifyTokenAndAdmin,
  verifyTokenAndUser,
};
