const STATUS_CODES = require("../constants/statusCodes");
const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";

  if (!err.isOperational) {
    console.error("Error:", err);
    message = "Internal Server Error";
    statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR;
  }

  const response = {
    status: "error",
    message,
  };

  if (err.data) {
    Object.assign(response, err.data);
  }

  if (req.accepts("json")) {
    res.status(statusCode).json(response);
  } else {
    res.status(statusCode).send(message);
  }
};

module.exports = errorHandler;
