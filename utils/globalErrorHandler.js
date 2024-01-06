const globalErrorHandler = (err, req, res, next) => {
  const { statusCode, message } = err;
  console.log(err);
  res.status(statusCode || 500).json({ message: message || "Something went wrong" });
};

module.exports = globalErrorHandler;
