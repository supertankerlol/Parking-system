import { Request, Response, NextFunction } from 'express';

const isDevelopment = process.env.NODE_ENV !== 'production';

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
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
  
  // Get error code for frontend handling
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Prepare response
  const response: { message: string; code: string; error?: string } = {
    message: err.message || 'Internal Server Error',
    code: errorCode,
  };

  // In development: add error details
  if (isDevelopment) {
    response.error = err.message;
  }

  res.status(statusCode).json(response);
};
