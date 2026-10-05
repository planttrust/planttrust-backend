const logger = require('./logger')('ErrorHandler');

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`
  });
};

const globalErrorHandler = (err, req, res, next) => {
  logger.error({ err, req: { method: req.method, url: req.originalUrl } }, 'Unhandled Exception');
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.'
  });
};

module.exports = { notFoundHandler, globalErrorHandler };
