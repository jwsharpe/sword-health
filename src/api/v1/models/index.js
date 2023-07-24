const dbConfig = require("../configs/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  dbConfig
);
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Manager = require("./managers.model.js")(sequelize, Sequelize);
db.Technician = require("./technicians.model.js")(sequelize, Sequelize);
db.Task = require("./tasks.model.js")(sequelize, Sequelize);

db.Manager.associate(db);
db.Technician.associate(db);
db.Task.associate(db);

module.exports = db;
