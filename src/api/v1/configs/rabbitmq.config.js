require("dotenv").config();
const env = process.env;
const connectionUrl =
  "amqp://" + env.RABBITMQ_HOST + ":" + env.RABBITMQ_DOCKER_PORT;
const queueName = env.RABBITMQ_QUEUE;

const rabbitmq = {
  queueName: queueName,
  connectionUrl: connectionUrl,
};

module.exports = rabbitmq;
