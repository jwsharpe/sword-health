const tasksController = require("../../../../src/api/v1/controllers/tasks.controller.js");
const TaskService = require("../../../../src/api/v1/services/tasks.service.js");
const Constants = require("../../../../src/api/v1/utils/Constants.js");

jest.mock("../../../../src/api/v1/services/tasks.service.js");

describe("Tasks Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getTask - should call TaskService.findTaskById with the correct arguments", async () => {
    const req = {};
    const res = { json: jest.fn() };

    await tasksController.getTask(req, res);

    expect(TaskService.findTaskById).toHaveBeenCalledWith(req, res);
  });

  test("getTasks - should call TaskService.findTasksByManagerId for manager role", async () => {
    const req = { roleData: { role: Constants.MANAGER } };
    const res = {};

    await tasksController.getTasks(req, res);

    expect(TaskService.findTasksByManagerId).toHaveBeenCalledWith(req, res);
  });

  test("getTasks - should call TaskService.findTasksByTechnicianId for technician role", async () => {
    const req = { roleData: { role: Constants.TECHNICIAN } };
    const res = {};

    await tasksController.getTasks(req, res);

    expect(TaskService.findTasksByTechnicianId).toHaveBeenCalledWith(req, res);
  });

  test("createTask - should call TaskService.createTask with the correct arguments", async () => {
    const req = {};
    const res = {};

    await tasksController.createTask(req, res);

    expect(TaskService.createTask).toHaveBeenCalledWith(req, res);
  });

  test("updateTask - should call TaskService.updateTask with the correct arguments", async () => {
    const req = {};
    const res = {};

    await tasksController.updateTask(req, res);

    expect(TaskService.updateTask).toHaveBeenCalledWith(req, res);
  });

  test("markTaskDeleted - should call TaskService.markTaskDeleted with the correct arguments", async () => {
    const req = {};
    const res = {};

    await tasksController.markTaskDeleted(req, res);

    expect(TaskService.markTaskDeleted).toHaveBeenCalledWith(req, res);
  });
});
