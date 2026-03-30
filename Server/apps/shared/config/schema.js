const Joi = require("joi");

const schema = Joi.object({
  APP_NAME: Joi.string().default("Ledger Flow"),

  SERVER_PORT: Joi.number().default(8080),

  MONGO_URI: Joi.string().required(),

  DB_DIALECT: Joi.string().default("mongo"),

  DB_DEBUG: Joi.string().valid("YES", "NO").default("NO"),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),

  JWT_ACCESS_TOKEN_EXPIRES: Joi.string().default("15m"),
  JWT_REFRESH_TOKEN_EXPIRES: Joi.string().default("7d"),

  KAFKA_BROKERS: Joi.string().required(),

  API_CLIENT_ID: Joi.string().required(),
  LEDGER_CLIENT_ID: Joi.string().required(),
  RISK_CLIENT_ID: Joi.string().required(),
  NOTIFICATION_CLIENT_ID: Joi.string().required(),

  LEDGER_GROUP_ID: Joi.string().required(),
  RISK_GROUP_ID: Joi.string().required(),
  NOTIFICATION_GROUP_ID: Joi.string().required(),

  TOPIC_TRANSACTION_CREATED: Joi.string().required(),
  TOPIC_TRANSACTION_UPDATED: Joi.string().required(),
  TOPIC_LEDGER_UPDATED: Joi.string().required(),
  TOPIC_NOTIFICATION_SEND: Joi.string().required(),
  TOPIC_RISK_ANALYZED: Joi.string().required(),

  TOPIC_TRANSACTION_RETRY: Joi.string().required(),
  TOPIC_TRANSACTION_DLQ: Joi.string().required(),

  KAFKA_PARTITION_KEY: Joi.string().default("userId"),

  KAFKA_MAX_RETRY: Joi.number().default(3),
  KAFKA_RETRY_DELAY_MS: Joi.number().default(5000),

  REDIS_HOST: Joi.string().default("localhost"),
  REDIS_PORT: Joi.number().default(6379),
}).unknown();

module.exports = schema;