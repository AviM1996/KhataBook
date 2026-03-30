require("../env");

const schema = require("./schema");

const loadConfig = () => {
  const { value, error } = schema.validate(process.env, {
    abortEarly: false,
  });

  if (error) {
    console.error("Config Validation Error:");
    error.details.forEach((err) => {
      console.error(`- ${err.message}`);
    });

    process.exit(1);
  }

  return {
    appName: value.APP_NAME,
    port: value.SERVER_PORT,

    database: {
      url: value.MONGO_URI,
      dialect: value.DB_DIALECT,
      logging: value.DB_DEBUG === "YES",
    },

    auth: {
      accessSecret: value.JWT_ACCESS_TOKEN_SECRET,
      refreshSecret: value.JWT_REFRESH_TOKEN_SECRET,
      accessExpire: value.JWT_ACCESS_TOKEN_EXPIRES,
      refreshExpire: value.JWT_REFRESH_TOKEN_EXPIRES,
    },

    kafka: {
      brokers: value.KAFKA_BROKERS.split(","),

      clients: {
        api: value.API_CLIENT_ID,
        ledger: value.LEDGER_CLIENT_ID,
        risk: value.RISK_CLIENT_ID,
        notification: value.NOTIFICATION_CLIENT_ID,
      },

      groups: {
        ledger: value.LEDGER_GROUP_ID,
        risk: value.RISK_GROUP_ID,
        notification: value.NOTIFICATION_GROUP_ID,
      },

      topics: {
        transactionCreated: value.TOPIC_TRANSACTION_CREATED,
        transactionUpdated: value.TOPIC_TRANSACTION_UPDATED,
        ledgerUpdated: value.TOPIC_LEDGER_UPDATED,
        notificationSend: value.TOPIC_NOTIFICATION_SEND,
        riskAnalyzed: value.TOPIC_RISK_ANALYZED,
        retry: value.TOPIC_TRANSACTION_RETRY,
        dlq: value.TOPIC_TRANSACTION_DLQ,
      },

      partitionKey: value.KAFKA_PARTITION_KEY,

      retry: {
        maxRetry: value.KAFKA_MAX_RETRY,
        delay: value.KAFKA_RETRY_DELAY_MS,
      },
    },

    redis: {
      host: value.REDIS_HOST,
      port: value.REDIS_PORT,
    },
  };
};

module.exports = {
  loadConfig,
};
