const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Task = require("../models/tasks");
const client = require("../storage/redis");
const { createRediskey, commonTaskChecks, updateRedis, processTaskCompletion } = require("../utils/taskUtils");

exports.getTasks = catchAsync(async (req, res, next) => {
  const { _id: user } = req.user;
  const key = createRediskey(user);

  let tasks = [];

  const redisData = await client.get(key);

  if (redisData) {
    tasks = JSON.parse(redisData);
  } else {
    tasks = await Task.find({ user });
    await client.set(key, JSON.stringify(tasks), "EX", process.env.REDIS_DATA_EXPIRY);
  }

  res.status(200).json({ tasks, message: `${tasks.length} tasks found` });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const { _id: user } = req.user;
  const { title, description, dueDate } = req.body;

  const errMessage = commonTaskChecks({ title, description, dueDate });
  if (errMessage) {
    return next(new AppError(errMessage, 400));
  }

  const task = await Task.create({ user, title, description, dueDate });
  await updateRedis(user);

  res.status(200).json({ message: "Task Created Successfully", task });
});

exports.updateTask = catchAsync(async (req, res, next) => {
  const { _id, title, description, dueDate } = req.body;
  if (!_id) {
    return next(new AppError("No Task Found"), 400);
  }

  const task = await Task.findById(_id);
  if (task._doc.status === "completed") {
    return next(new Error("Completed task can't be updated", 400));
  }

  const errMessage = commonTaskChecks({ title, description, dueDate });
  if (errMessage) {
    return next(new AppError(errMessage, 400));
  }

  const updatedTask = await Task.findByIdAndUpdate(_id, { title, description, dueDate }, { new: true });
  await updateRedis(req.user._id);

  res.status(200).json({ message: "Task Updated", task: updatedTask });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;

  const task = await Task.findById(taskId);
  if (task._doc.status === "completed") {
    return next(new AppError("Completed task can't be deleted", 400));
  }

  const deletedTask = await Task.findByIdAndDelete(taskId);
  await updateRedis(req.user._id);

  res.status(200).json({ message: "Task Deleted Successfully", task: deletedTask });
});

exports.markTaskAsCompleted = catchAsync(async (req, res, next) => {
  const { taskId } = req.params;
  const queue = process.env.REDIS_COMPLETION_QUEUE;

  const idx = await client.lpos(queue, taskId);
  if (idx !== null) {
    return res.status(200).json({ message: "Already added to queue" });
  }

  await client.rpush(queue, taskId);
  processTaskCompletion();

  res.status(200).json({ message: "Task Completion Queued" });
});
