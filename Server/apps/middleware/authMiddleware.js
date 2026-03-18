const jwt = require("jsonwebtoken");
const config = require('../config/config');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, config.auth.accessSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token expired" });
  }
};

module.exports = authMiddleware;
