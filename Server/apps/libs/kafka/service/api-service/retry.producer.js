const kafkaApiClient = require("./kafka.client");
const config = require("../../../../shared/config");
const { Partitioners } = require("kafkajs");

const producer = kafkaApiClient.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  maxInFlightRequests: 5,
  timeout: 10000,
});

const sendToRetry = async (data, retryCount = 0) => {
  await producer.send({
    topic: config.kafka.topics.retry,
    messages: [
      {
        key: data.userId?.toString() || "unknown",
        value: JSON.stringify({
          ...data,
          retryCount,
        }),
      },
    ],
  });

  console.log("♻️ Sent to RETRY topic");
};

const sendToDLQ = async (data) => {
  await producer.send({
    topic: config.kafka.topics.dlq,
    messages: [
      {
        key: data.userId?.toString() || "unknown",
        value: JSON.stringify(data),
      },
    ],
  });

  console.log("💀 Sent to DLQ");
};

module.exports = {
  sendToRetry,
  sendToDLQ,
};