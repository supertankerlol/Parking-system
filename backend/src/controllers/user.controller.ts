import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service';
import path from 'path';
import fs from 'fs/promises';

/**
 * Get current user profile
 * GET /api/users/me
 */
export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const user = await userService.getUserById(req.user.id);
    res.status(200).json({ user });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update user profile
 * PUT /api/users/me
 */
export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const { fullName, phone, defaultLicense } = req.body;

    const updateData: userService.UpdateProfileData = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (defaultLicense !== undefined) updateData.defaultLicense = defaultLicense;

    const updatedUser = await userService.updateProfile(req.user.id, updateData);
    res.status(200).json({ user: updatedUser });
  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Update user avatar
 * PUT /api/users/me/avatar
 */
export async function updateAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        message: 'No file uploaded',
      });
      return;
    }

    // Get file info
    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${req.user.id}-${Date.now()}${fileExtension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'avatars');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Move file to uploads directory
    const filePath = path.join(uploadsDir, fileName);
    await fs.rename(file.path, filePath);

    // Generate URL path (relative to server)
    // In production, this would be an S3 URL or CDN URL
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user avatar in database
    const updatedUser = await userService.updateAvatar(req.user.id, avatarUrl);

    res.status(200).json({
      user: updatedUser,
      message: 'Avatar updated successfully',
    });
  } catch (error: any) {
    // Clean up uploaded file if database update fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
    }

    if (error.message === 'User not found') {
      res.status(404).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get user payments
 * GET /api/users/payments
 */
export async function getPayments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const payments = await userService.getPayments(req.user.id);
    res.status(200).json({ payments });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user parking history
 * GET /api/users/history
 */
export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const history = await userService.getHistory(req.user.id);
    res.status(200).json({ history });
  } catch (error) {
    next(error);
  }
}
