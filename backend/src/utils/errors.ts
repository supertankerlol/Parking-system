/**
 * Custom error class with HTTP status code and error code support
 */
export class AppError extends Error {
  public status: number;
  public statusCode: number;
  public code: string;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.statusCode = status; // Support both properties
    this.code = code; // Machine-readable error code for frontend
    
    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common HTTP error factory functions
export const BadRequestError = (message: string = 'Bad Request', code: string = 'BAD_REQUEST') => 
  new AppError(message, 400, code);

export const UnauthorizedError = (message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') => 
  new AppError(message, 401, code);

export const ForbiddenError = (message: string = 'Forbidden', code: string = 'FORBIDDEN') => 
  new AppError(message, 403, code);

export const NotFoundError = (message: string = 'Not Found', code: string = 'NOT_FOUND') => 
  new AppError(message, 404, code);

export const ConflictError = (message: string = 'Conflict', code: string = 'CONFLICT') => 
  new AppError(message, 409, code);

export const InternalServerError = (message: string = 'Internal Server Error', code: string = 'INTERNAL_ERROR') => 
  new AppError(message, 500, code);
