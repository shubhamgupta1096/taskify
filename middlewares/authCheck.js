const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/appError");

const authChecker = catchAsync(async (req, res, next) => {
  let token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return next(new AppError("You are not logged in. Please login to gain access", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(new AppError("The user belonging to this token does not exist", 401));
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

module.exports = authChecker;
