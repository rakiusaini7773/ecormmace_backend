const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.admin = decoded; // optional: to access admin info later
    next();

  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
