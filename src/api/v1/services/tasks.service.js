const db = require("../models");
const Constants = require("../utils/Constants");
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");
const Task = db.Task;
const Technician = db.Technician;

const findTaskById = async (req, res) => {
  const { taskId } = req.params;
  const { roleData } = req;

  if (!taskId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Task ID is missing in the request." });
  }

  try {
    const task = await Task.findOne({
      include: {
        model: Technician,
        where:
          roleData.role === Constants.MANAGER
            ? { managerId: roleData.id }
            : { id: roleData.id },
      },
      where: { id: taskId, deletedDate: { [Op.is]: null } },
    });

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Task not found." });
    }

    if (
      roleData.role === Constants.TECHNICIAN &&
      task.technicianId !== roleData.id
    ) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ error: "Forbidden. Task does not belong to the technician." });
    }

    if (
      roleData.role === Constants.MANAGER &&
      task.technician.managerId !== roleData.id
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error:
          "Forbidden. Task does not belong to a technician managed by the manager.",
      });
    }

    res.status(StatusCodes.OK).json(task);
  } catch (err) {
    console.error("Error finding task:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Unable to find the task." });
  }
};

const findTasksByTechnicianId = async (req, res) => {
  const technicianId = req.roleData.id;
  if (!technicianId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Technician ID is missing in the request." });
  }

  try {
    const tasks = await Task.findAll({
      where: {
        [Op.and]: [{ technicianId }, { deletedDate: { [Op.is]: null } }],
      },
    });

    if (tasks.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "No tasks found for the given technician ID." });
    }

    res.status(StatusCodes.OK).json(tasks);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message || "Some error occurred while retrieving tasks.",
    });
  }
};

const findTasksByManagerId = async (req, res) => {
  const managerId = req.roleData.id;

  if (!managerId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Manager ID is missing in the request." });
  }

  try {
    const tasks = await Task.findAll({
      where: { deletedDate: { [Op.is]: null } },
      include: {
        model: Technician,
        where: { managerId },
      },
    });

    if (tasks.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "No tasks found for the given manager ID." });
    }

    res.status(StatusCodes.OK).json(tasks);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: err.message || "Some error occurred while retrieving tasks.",
    });
  }
};

const createTask = async (req, res) => {
  if (req.roleData.role != Constants.TECHNICIAN) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
  }

  const { title, summary } = req.body;
  const technicianId = req.roleData.id;

  if (!title || !technicianId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Incomplete task data. Please provide title.",
    });
  }

  try {
    const technician = await Technician.findByPk(technicianId);
    if (!technician) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Technician not found." });
    }

    const newTask = await Task.create({
      title,
      summary,
      technicianId,
    });

    res.status(StatusCodes.CREATED).json(newTask);
    return newTask;
  } catch (err) {
    console.error("Error creating task:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Unable to create task." });
  }
};

const updateTask = async (req, res) => {
  if (req.roleData.role != Constants.TECHNICIAN) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
  }

  const { taskId } = req.params;
  const { title, summary } = req.body;
  const { roleData } = req;

  if (!title && !summary) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      error: "Incomplete task data. Please provide title or summary.",
    });
  }

  try {
    const task = await Task.findOne({
      where: { [Op.and]: [{ id: taskId }, { deletedDate: { [Op.is]: null } }] },
    });

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Task not found." });
    }

    if (
      roleData.role == Constants.TECHNICIAN &&
      task.technicianId != roleData.id
    ) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error: "Forbidden. Task does not belong to the technician.",
      });
    }

    await task.update({
      title,
      summary,
    });

    res.status(StatusCodes.OK).json({ message: "Task updated successfully." });
  } catch (err) {
    console.error("Error updating task:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Unable to update task." });
  }
};

const markTaskDeleted = async (req, res) => {
  if (req.roleData.role != Constants.MANAGER) {
    return res.status(StatusCodes.FORBIDDEN).json({ error: "Forbidden" });
  }

  const { taskId } = req.params;

  try {
    const task = await Task.findByPk(taskId, {
      include: {
        model: Technician,
      },
    });

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ error: "Task not found." });
    }

    if (task.technician.managerId != req.roleData.id) {
      return res.status(StatusCodes.FORBIDDEN).json({
        error:
          "Unauthorized. Manager is not allowed to mark tasks as deleted for this technician.",
      });
    }

    if (task.deletedDate !== null) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Task has already been deleted.",
      });
    }

    await task.update({
      deletedDate: new Date(),
    });

    res.status(StatusCodes.OK).json({ message: "Task marked as deleted." });
  } catch (err) {
    console.error("Error marking task as deleted:", err);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Unable to mark task as deleted." });
  }
};

module.exports = {
  findTaskById,
  findTasksByTechnicianId,
  findTasksByManagerId,
  createTask,
  updateTask,
  markTaskDeleted,
};
