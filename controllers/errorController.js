/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-expressions */
const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
  // const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  // const value = err.keyValue.name;
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate Field value: ${value} Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = (err) => {
  const errors = Object.values(err.errors).map((item) => item.message);
  const message = `Invalid Input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const hanndleJWTError = () =>
  new AppError('Invalid Token. Please login again!', 401);

const hanndleJWTExpiredError = () =>
  new AppError('Your token has expired. Please login again!', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational , trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or Other unknown error: don't leak error details
  } else {
    // 1 log the error
    console.error('ERROR 💥', err);
    // 2 send generic message
    res
      .status(500)
      .json({ status: 'fail', message: 'Something went very wrong!' });
  }
};

// global error handler with4 arguments in next
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // error.name = err.name;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDb(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDb(error);
    if (err.name === 'JsonWebTokenError') error = hanndleJWTError(); //when user has invalid token
    if (err.name === 'TokenExpiredError') error = hanndleJWTExpiredError(); //when user token has expired

    error.message ? sendErrorProd(error, res) : sendErrorProd(err, res);
  }
};
