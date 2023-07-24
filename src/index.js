const express = require("express");
const cors = require("cors");
const { authorize } = require("./api/v1/middleware/authorize");
const { queryUser } = require("./api/v1/middleware/queryUser.js");
const bodyParser = require("body-parser");

require("dotenv").config();

const app = express();

const tasksRoute = require("./api/v1/routes/tasks.route.js");

app.use(cors({ origin: "http://localhost:8081" }));
app.use(bodyParser.json());

const db = require("./api/v1/models/index.js");
db.sequelize
  .sync()
  .then(() => {
    console.log("Synced Database.");
  })
  .catch(console.error);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

app.use("/v1/tasks", authorize, queryUser, tasksRoute);

const PORT = process.env.NODE_DOCKER_PORT || 8080;
app.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    return console.error(err);
  }
  return console.log(`Example app listening at http://localhost:${PORT}`);
});
