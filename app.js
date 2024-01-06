const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const globalErrorHandler = require("./utils/globalErrorHandler");

//Router imports
const authRouter = require("./routes/authRouter");
const taskRouter = require("./routes/taskRouter");
const authChecker = require("./middlewares/authCheck");

//cron jobs
require("./cron-jobs/taskReminder");

const app = express();

//Basic Middlewares
app.use(morgan("dev"));
app.use(cors());
app.use(express.json({ urlencoded: true }));

//Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/task", authChecker, taskRouter);

app.use(globalErrorHandler);
module.exports = app;
