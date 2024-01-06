const Task = require("../models/tasks");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const taskUserRelationCheck = catchAsync(async (req, res, next) => {
  const { _id: user } = req.user;
  const _id = req.body._id || req.params.taskId;
  if (!_id) {
    return next(new AppError("Task Not found", 400));
  }

  const task = await Task.findById(_id);
  if (!task) {
    return next(new AppError("Task not found"), 400);
  }

  const taskBelongsToUser = user.toString() === task._doc.user._id.toString();
  if (!taskBelongsToUser) {
    return next(new AppError("Task does not belong to the current user", 400));
  }

  next();
});

module.exports = taskUserRelationCheck;
