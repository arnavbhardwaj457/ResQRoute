import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction) {
  next(new HttpError(404, 'Route not found'));
}

export function errorHandler(error: unknown, _req: Request, res: Response, next: NextFunction) {
  void next;

  logger.error('Request processing failed', {
    path: _req.path,
    method: _req.method,
    error: error instanceof Error ? error.message : String(error),
  });

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.issues,
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  return res.status(500).json({ error: message });
}
