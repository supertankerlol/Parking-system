import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { prisma } from '../repositories/prisma.client';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header and attaches user to req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Missing or invalid authorization header',
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        message: 'Missing token',
      });
      return;
    }

    // Verify token
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        message: 'Invalid or expired token',
      });
      return;
    }

    // Extract userId from decoded token
    if (!decoded.userId) {
      res.status(401).json({
        message: 'Invalid token payload',
      });
      return;
    }

    // Load user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        defaultLicense: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        message: 'User not found',
      });
      return;
    }

    // Attach user to request object
    req.user = user;

    // Continue to next middleware
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Authentication failed',
    });
  }
}
