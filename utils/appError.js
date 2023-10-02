// the err obj used every where is returned by this class now . the error obj will have statusCode, status, isOperational propertires on it.

class AppError extends Error {
  constructor(message, statusCode) {
    // the build in error class only accepts a message,  ie this will trigger the error
    //  whatever we pass into Error will be the message property of the error obj
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // to know where the error happened in the code we capture sack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
