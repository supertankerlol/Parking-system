import { Request, Response, NextFunction } from 'express';

/**
 * Admin authorization middleware
 * Checks if the authenticated user has admin or owner role
 * Must be used after authenticate middleware
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      message: 'Unauthorized',
    });
    return;
  }

  // Check if user has admin or owner role
  if (req.user.role !== 'admin' && req.user.role !== 'owner') {
    res.status(403).json({
      message: 'Forbidden: Admin access required',
    });
    return;
  }

  // User is authorized, continue
  next();
}
