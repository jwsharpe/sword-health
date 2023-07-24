const tasksService = require("../../../../src/api/v1/services/tasks.service.js");
const db = require("../../../../src/api/v1/models");
const Constants = require("../../../../src/api/v1/utils/Constants");
const { Op } = require("sequelize");
const { StatusCodes } = require("http-status-codes");

jest.mock("../../../../src/api/v1/models");
jest.mock("../../../../src/api/v1/utils/Constants");

describe("Tasks Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock data for testing
  const req = {
    params: { taskId: 1 },
    body: {},
    roleData: { role: "", id: 1 },
  };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

  // Mock Sequelize models
  const mockTask = {
    id: 1,
    title: "Mock Task",
    summary: "Mock Summary",
    technicianId: 1,
    deletedDate: null,
    update: jest.fn(), // Mock the 'update' method for Task
    technician: { managerId: 1 }, // Mock the Technician association for Task
  };

  const mockTechnician = {
    id: 1,
    name: "Mock Technician",
  };

  // Mock the Sequelize models and their methods
  db.Task.findOne = jest.fn();
  db.Task.findOne.mockResolvedValue(mockTask);

  db.Task.findAll = jest.fn();
  db.Task.findAll.mockResolvedValue([mockTask]);

  db.Technician.findByPk = jest.fn();
  db.Technician.findByPk.mockResolvedValue(mockTechnician);

  describe("findTaskById", () => {
    test("should handle missing taskId in the request", async () => {
      req.params.taskId = null;

      await tasksService.findTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task ID is missing in the request.",
      });
    });

    test("should handle not found task and send 404 response", async () => {
      req.params.taskId = 1;
      db.Task.findOne.mockResolvedValueOnce(null);

      await tasksService.findTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ error: "Task not found." });
    });

    test("should handle forbidden access and send 403 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      db.Task.findOne.mockResolvedValueOnce({ technicianId: 2 });

      await tasksService.findTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden. Task does not belong to the technician.",
      });
    });

    test("should handle successful retrieval and send 200 response", async () => {
      req.roleData.role = Constants.MANAGER;
      db.Task.findOne.mockResolvedValueOnce({
        technicianId: 1,
        technician: { managerId: 1 },
      });

      await tasksService.findTaskById(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
    });
  });

  describe("findTasksByTechnicianId", () => {
    test("should handle missing technicianId in the request", async () => {
      req.roleData.id = null;

      await tasksService.findTasksByTechnicianId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Technician ID is missing in the request.",
      });
    });

    test("should handle no tasks found and send 404 response", async () => {
      db.Task.findAll.mockResolvedValueOnce([]);
      req.roleData.id = 1;
      req.params.taskId = 2;

      await tasksService.findTasksByTechnicianId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: "No tasks found for the given technician ID.",
      });
    });

    test("should handle successful retrieval and send 200 response", async () => {
      db.Task.findAll.mockResolvedValueOnce([mockTask]);

      await tasksService.findTasksByTechnicianId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith([mockTask]);
    });
  });

  describe("findTasksByManagerId", () => {
    test("should handle missing managerId in the request", async () => {
      req.roleData.id = null;

      await tasksService.findTasksByManagerId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Manager ID is missing in the request.",
      });
    });

    test("should handle no tasks found and send 404 response", async () => {
      req.roleData.id = 1;
      db.Task.findAll.mockResolvedValueOnce([]);

      await tasksService.findTasksByManagerId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: "No tasks found for the given manager ID.",
      });
    });

    test("should handle successful retrieval and send 200 response", async () => {
      db.Task.findAll.mockResolvedValueOnce([mockTask]);

      await tasksService.findTasksByManagerId(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith([mockTask]);
    });
  });

  describe("createTask", () => {
    test("should handle forbidden access for non-technician and send 403 response", async () => {
      req.roleData.role = Constants.MANAGER;

      await tasksService.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    test("should handle missing title or technicianId in the request and send 400 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      req.body.title = null;
      req.roleData.id = null;

      await tasksService.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Incomplete task data. Please provide title.",
      });
    });

    test("should handle not found technician and send 404 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      req.roleData.id = 1;
      req.body.title = "Title";
      db.Technician.findByPk.mockResolvedValueOnce(null);

      await tasksService.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: "Technician not found.",
      });
    });

    test("should handle successful task creation and send 201 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      db.Technician.findByPk.mockResolvedValueOnce({});

      await tasksService.createTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    test("should handle forbidden access for non-technician and send 403 response", async () => {
      req.roleData.role = Constants.MANAGER;

      await tasksService.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    test("should handle missing title and summary in the request and send 400 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      req.body.title = null;
      req.body.summary = null;

      await tasksService.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        error: "Incomplete task data. Please provide title or summary.",
      });
    });

    test("should handle not found task and send 404 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;
      req.body.title = "Title";
      db.Task.findOne.mockResolvedValueOnce(null);

      await tasksService.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task not found.",
      });
    });

    test("should handle forbidden access for technician if task does not belong to the technician and send 403 response", async () => {
      req.body.title = "Title";
      req.body.summary = "Summary";
      req.params.taskId = 1;
      req.roleData.role = Constants.TECHNICIAN;
      db.Task.findOne.mockResolvedValueOnce({
        technicianId: "some-other-technician-id",
      });

      await tasksService.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden. Task does not belong to the technician.",
      });
    });

    test("should handle successful task update and send 200 response", async () => {
      req.body.title = "Title";
      req.body.summary = "Summary";
      req.params.taskId = 1;
      req.roleData.role = Constants.TECHNICIAN;
      db.Task.findOne.mockResolvedValueOnce({
        technicianId: 1,
        update: jest.fn(),
      });

      await tasksService.updateTask(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: "Task updated successfully.",
      });
    });
  });

  describe("markTaskDeleted", () => {
    test("should handle forbidden access for non-manager and send 403 response", async () => {
      req.roleData.role = Constants.TECHNICIAN;

      await tasksService.markTaskDeleted(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    });

    test("should handle not found task and send 404 response", async () => {
      req.roleData.role = Constants.MANAGER;
      db.Task.findByPk.mockResolvedValueOnce(null);

      await tasksService.markTaskDeleted(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({
        error: "Task not found.",
      });
    });

    test("should handle unauthorized access and send 403 response", async () => {
      req.roleData.role = Constants.MANAGER;
      db.Task.findByPk.mockResolvedValueOnce({
        technician: { managerId: "some-other-manager-id" },
      });

      await tasksService.markTaskDeleted(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(res.json).toHaveBeenCalledWith({
        error:
          "Unauthorized. Manager is not allowed to mark tasks as deleted for this technician.",
      });
    });

    test("should handle already deleted task and send 400 response", async () => {
      req.roleData.role = Constants.MANAGER;
      db.Task.findByPk.mockResolvedValueOnce({
        technician: { managerId: req.roleData.id },
        deletedDate: new Date(),
      });

      await tasksService.markTaskDeleted(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith({
        message: "Task has already been deleted.",
      });
    });

    test("should handle successful task deletion and send 200 response", async () => {
      req.roleData.role = Constants.MANAGER;
      db.Task.findByPk.mockResolvedValueOnce({
        technician: { managerId: req.roleData.id },
        deletedDate: null,
        update: jest.fn(),
      });

      await tasksService.markTaskDeleted(req, res);

      expect(res.status).toHaveBeenCalledWith(StatusCodes.OK);
      expect(res.json).toHaveBeenCalledWith({
        message: "Task marked as deleted.",
      });
    });
  });
});
