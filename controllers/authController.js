const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const requestChecker = require("../utils/requestChecker");

const createToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

exports.signup = catchAsync(async (req, res, next) => {
  const { email, name, password } = req.body;

  const emptyFields = requestChecker({ Email: email, Name: name, Password: password });
  if (emptyFields) {
    return next(new AppError(emptyFields, 400));
  }

  const emailAlready = await User.findOne({ email });
  if (emailAlready) {
    return next(new Error("Email already present", 400));
  }

  const user = await User.create({ email, password, name });
  const token = createToken(user._doc);
  const { password: p, ...rest } = user._doc;

  res.status(200).json({ message: "Signed Up Successfully", token, user: rest });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const invalidUserMessage = "Email or password incorrect";

  const emptyFields = requestChecker({ Email: email, Password: password });
  if (emptyFields) {
    return next(new AppError(emptyFields, 400));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError(invalidUserMessage, 400));
  }

  const correctPassword = await user.comparePassword(password, user.password);
  if (!correctPassword) {
    return next(new AppError(invalidUserMessage, 400));
  }

  const token = createToken(user._doc);
  const { password: p, ...rest } = user._doc;
  res.status(200).json({ message: "Logged in Successfully", token, user: rest });
});
