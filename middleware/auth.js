const jwt = require('jsonwebtoken');

// ✅ Generic Token Verification (used before role check)
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // 👈 Always attach decoded user to `req.user`
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Admin-Only Access
const verifyAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ✅ User-Only Access
const verifyUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return res.status(403).json({ message: "Access denied. Users only." });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyUser
};
