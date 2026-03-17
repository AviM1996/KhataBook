const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log(`[AUTH MIDDLEWARE] Called for ${req.method} ${req.url}`);
  console.log(`${req.method} ${req.originalUrl}`);
  next();
};

module.exports = authMiddleware;
