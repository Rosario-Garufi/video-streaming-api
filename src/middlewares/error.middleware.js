const config = require('../config');
const ApiError = require('../utils/ApiError');

//error handling middleware

const errorHandler = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Somethings went wrong';
    error = new ApiError(statusCode, message, error?.errors || [], error.stack);
  }
  //final response
  const response = {
    success: false,
    message: error?.message,
    errors: error?.errors,
    stack: config.nodeEnv !== 'production' ? error.stack : undefined,
  };

  //return response
  return res.status(error.statusCode).json(response);
};

//not found middleware

const notFound = (req, res, next) => {
  const err = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(err);
};

module.exports = {
  errorHandler,
  notFound,
};
