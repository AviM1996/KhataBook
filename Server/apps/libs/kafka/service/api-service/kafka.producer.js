const kafkaApiClient = require("./kafka.client");
const config = require("../../../../shared/config");
const { sendToRetry, sendToDLQ } = require("./retry.producer");
const { Partitioners } = require("kafkajs");

const producer = kafkaApiClient.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
  maxInFlightRequests: 5,
  timeout: 10000,
});

const connectProducer = async () => {
  await producer.connect();
  console.log("Api Producer Connect Successfully");
};

const safeSend = async (topic, data) => {
  try {
    return await producer.send({
      topic,
      messages: [
        {
          key:
            data.userId?.toString() ||
            data.createdBy?.toString() ||
            "unknown",
          value: JSON.stringify(data),
        },
      ],
    });
  } catch (error) {
    console.error("❌ Kafka send failed:", error.message);

    const retryCount = data.retryCount || 0;

    if (retryCount < config.kafka.retry.maxRetry) {
      await sendToRetry(data, retryCount + 1);
    } else {
      await sendToDLQ(data);
    }
  }
};

const sendTransectionCreated = (data) => safeSend(config.kafka.topics.transactionCreated, data);
const sendTransectionUpdated = (data) => safeSend(config.kafka.topics.transactionUpdated, data);

module.exports = {
  connectProducer,
  sendTransectionCreated,
  sendTransectionUpdated,
};