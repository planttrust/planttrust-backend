import type { ErrorRequestHandler, RequestHandler } from 'express';
import { MulterError } from 'multer';
import { z, ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, 'BAD_REQUEST', message, details);
export const unauthorized = (message = 'Authentication required') =>
  new HttpError(401, 'UNAUTHORIZED', message);
export const forbidden = (message = 'You do not have permission to do this') =>
  new HttpError(403, 'FORBIDDEN', message);
export const notFoundError = (message = 'Not found') => new HttpError(404, 'NOT_FOUND', message);
export const conflict = (message: string) => new HttpError(409, 'CONFLICT', message);

export const notFound: RequestHandler = (req, _res, next) => {
  next(notFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }
  if (err instanceof MulterError) {
    res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: z.flattenError(err),
      },
    });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } });
};
