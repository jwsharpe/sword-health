const { StatusCodes } = require("http-status-codes");
const TaskService = require("../services/tasks.service.js");
const NotificationService = require("../services/notification.service.js");
const Constants = require("../utils/Constants.js");

const getTask = async (req, res) => {
  return await TaskService.findTaskById(req, res);
};

const getTasks = async (req, res) => {
  if (req.roleData.role == Constants.MANAGER) {
    await TaskService.findTasksByManagerId(req, res);
  } else {
    await TaskService.findTasksByTechnicianId(req, res);
  }
};

const createTask = async (req, res) => {
  const task = await TaskService.createTask(req, res);
  if (res.statusCode == StatusCodes.CREATED) {
    NotificationService.sendTaskNotification(task);
  }
  return task;
};

const updateTask = async (req, res) => {
  return await TaskService.updateTask(req, res);
};

const markTaskDeleted = async (req, res) => {
  return await TaskService.markTaskDeleted(req, res);
};

module.exports = {
  getTask,
  getTasks,
  createTask,
  updateTask,
  markTaskDeleted,
};
