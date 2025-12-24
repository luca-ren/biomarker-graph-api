import type { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';

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

  console.error(err);
  return res
    .status(500)
    .json({ error: 'INTERNAL_ERROR', message: 'Something went wrong' });
}
