import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { HttpError } from './HttpError';

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request',
      details: z.treeifyError(err)
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: 'HTTP_ERROR',
      message: err.message
    });
  }

  console.error(err);
  return res
    .status(500)
    .json({ error: 'INTERNAL_ERROR', message: 'Something went wrong' });
}
