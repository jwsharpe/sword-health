require("dotenv").config();
const amqp = require("amqplib");
const rabbitmqConfig = require("../configs/rabbitmq.config");
const { connectionUrl, queueName } = rabbitmqConfig;

const sendAndRecieveMessage = async (msg) => {
  try {
    console.log("Sending message: ", msg);
    const connection = await amqp.connect(connectionUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName);
    await channel.sendToQueue(queueName, Buffer.from(msg));

    channel.consume(queueName, (message) => {
      if (message) {
        console.log("Received message: ", message.content.toString());
        channel.ack(message);
      } else {
        channel.close();
        connection.close();
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

module.exports = {
  sendAndRecieveMessage,
};
