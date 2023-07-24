const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const ManagerMock = dbMock.define("manager", {
  name: "John Doe",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const TechnicianMock = dbMock.define("technician", {
  name: "Jane Smith",
  createdAt: new Date(),
  updatedAt: new Date(),
});

const TaskMock = dbMock.define("task", {
  title: "Sample Task",
  summary: "This is a test task",
  deletedDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
});

TechnicianMock.belongsTo(ManagerMock);
ManagerMock.hasMany(TechnicianMock);
TaskMock.belongsTo(TechnicianMock);
TechnicianMock.hasMany(TaskMock);

describe("Manager Model", () => {
  it("should create a new manager", async () => {
    const newManager = await ManagerMock.create({
      name: "John Doe",
    });
    expect(newManager.name).toBe("John Doe");
  });
});

describe("Technician Model", () => {
  it("should create a new technician", async () => {
    const newTechnician = await TechnicianMock.create({
      name: "Jane Smith",
    });
    expect(newTechnician.name).toBe("Jane Smith");
  });
});

describe("Task Model", () => {
  it("should create a new task", async () => {
    const newTask = await TaskMock.create({
      title: "Sample Task",
      summary: "This is a test task",
    });
    expect(newTask.title).toBe("Sample Task");
    expect(newTask.summary).toBe("This is a test task");
  });
});
