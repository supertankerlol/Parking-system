import { Request, Response, NextFunction } from 'express';

const isDevelopment = process.env.NODE_ENV !== 'production';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  console.error('Error:', err);

  // Get status code (check both status and statusCode properties)
  const statusCode = err.status || err.statusCode || 500;

  // Prepare response based on environment
  if (isDevelopment) {
    // In development: return message and error details
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
      error: err.message,
    });
  } else {
    // In production: return only message
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error',
    });
  }
};
