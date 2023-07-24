const queue = require("../queues/messageQueue");

const sendTaskNotification = async (task) => {
  const { technicianId, id, createdAt } = task;
  const message = `Tech ${technicianId} sent Task ${id} on Date ${createdAt}`;
  queue.sendAndRecieveMessage(message);
};

module.exports = {
  sendTaskNotification,
};
