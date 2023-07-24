const express = require("express");
const router = express.Router();
const tasksController = require("../controllers/tasks.controller.js");

router.get("/", tasksController.getTasks);

router.get("/:taskId", tasksController.getTask);

router.post("/", tasksController.createTask);

router.patch("/:taskId", tasksController.updateTask);

router.delete("/:taskId", tasksController.markTaskDeleted);

module.exports = router;
