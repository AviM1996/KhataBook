const kafka= require("kafkajs");
const config = require("../../../../shared/config");

const kafkaApiClient = new kafka.Kafka({
    clientId: config.kafka.clients.api,
    brokers: config.kafka.brokers,
    connectionTimeout: 10000,
    requestTimeout: 10000,
    retry: {
      initialRetryTime: 100,
      retries: 8,
      maxRetryTime: 30000,
      multiplier: 2,
      randomizationFactor: 0.2,
    },
    ssl: false,
})

module.exports=kafkaApiClient
   
