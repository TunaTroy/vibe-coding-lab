import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({ message: 'Internal server error.' });
}
