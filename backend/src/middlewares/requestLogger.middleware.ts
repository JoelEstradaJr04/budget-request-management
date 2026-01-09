// src/middlewares/requestLogger.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Log response only for errors
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      const duration = Date.now() - startTime;
      console.error('Request failed:', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id
      });
    }
  });

  next();
};
