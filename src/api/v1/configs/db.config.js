require("dotenv").config();
const env = process.env;

const db = {
  host: env.DB_HOST,
  user: env.DB_USER,
  port: env.DB_PORT,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

module.exports = db;
