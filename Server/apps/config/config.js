require("dotenv").config();

const getEnv = (key, defaultValue = null) => {
  const value = process.env[key] || defaultValue;

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};

const config = {
  appName: getEnv("APP_NAME", "Ledger Flow"),
  port: getEnv("SERVER_PORT", 8080),

  database: {
    url: getEnv("MONGO_URI"),
    dialect: getEnv("DB_DIALECT", "mongo"),
    logging: process.env.DB_DEBUG === "YES"
  },

  auth: {
    accessSecret: getEnv("JWT_ACCESS_TOKEN_SECRET"),
    refreshSecret: getEnv("JWT_REFRESH_TOKEN_SECRET"),
    accessExpire: getEnv("JWT_ACCESS_TOKEN_EXPIRES", "15m"),
    refreshExpire: getEnv("JWT_REFRESH_TOKEN_EXPIRES", "7d")
  }
};

module.exports = config;