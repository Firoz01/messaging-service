const AppError = require('../ErrorHandler/errorHandler');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];

  const message = `Duplicate fields value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      name: err.name,
      stack: err.stack
    });
  }
};

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // a) Operational, truster error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // b) Programming or other unknown error: don't leak error details
    // 1) Log Error
    console.error('ERROR 🔥', err);

    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message; // we do this because for some reason err.message was not being copied

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(err); // Couldn't use error here as the paramter
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err); // Also here: Video 9.12
    sendErrorProd(error, req, res);
  }
};
