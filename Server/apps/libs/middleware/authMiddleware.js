const jwt = require("jsonwebtoken");
const config = require("../../shared/config");;
const BlacklistedToken = require('../../models/BlacklistedToken');

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    // Check blacklist
    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Token invalidated" });
    }

    const decoded = jwt.verify(token, config.auth.accessSecret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token expired" });
  }
};

module.exports = authMiddleware;
