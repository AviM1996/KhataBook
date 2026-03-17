const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.auth.accessSecret, {
    expiresIn: config.auth.accessExpire || "15m",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.auth.refreshSecret, {
    expiresIn: config.auth.refreshExpire || "7d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, config.auth.accessSecret);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.auth.refreshSecret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};