import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { generateToken } from '../utils/token';

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { fullName, email, phone, licensePlate, password } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      res.status(400).json({
        message: 'Missing required fields: fullName, email, and password are required',
      });
      return;
    }

    // Create user
    const user = await authService.signup({
      fullName,
      email,
      phone,
      licensePlate,
      password,
    });

    // Generate token for the new user
    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Login a user
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        message: 'Missing required fields: email and password are required',
      });
      return;
    }

    // Login user
    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Logout a user (dummy implementation)
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // In a stateless JWT system, logout is typically handled client-side
    // by removing the token. If using refresh tokens, you would invalidate
    // the refresh token here.
    res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}
