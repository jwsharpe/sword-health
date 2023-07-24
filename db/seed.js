const mysql = require("mysql2");
const fs = require("fs");

require("dotenv").config();
const env = process.env;

const seedQuery = fs.readFileSync("./db/seed.sql", { encoding: "utf-8" });

const connection = mysql.createConnection({
  host: "localhost",
  port: "3307",
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
});

connection.connect();

connection.query(seedQuery, [], (err) => {
  if (err) {
    throw err;
  }

  console.log("SQL seed completed");
  connection.end();
});
