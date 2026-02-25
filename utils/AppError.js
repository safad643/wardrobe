const STATUS_CODES = require("../constants/statusCodes");

class AppError extends Error {
  constructor(message, statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
