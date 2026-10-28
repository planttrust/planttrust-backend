import { Request, Response, NextFunction } from 'express';
import createLogger from './logger';

const logger = createLogger('ErrorHandler');

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`
  });
};

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error({ err, req: { method: req.method, url: req.originalUrl } }, 'Unhandled Exception');
  
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.'
  });
};

export default { notFoundHandler, globalErrorHandler };
