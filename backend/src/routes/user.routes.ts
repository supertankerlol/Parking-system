import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Ensure uploads/temp directory exists
const tempDir = path.join(process.cwd(), 'uploads', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Temporary directory for uploads (will be moved in controller)
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticate, userController.getMe);

/**
 * PUT /api/users/me
 * Update user profile
 */
router.put('/me', authenticate, userController.updateProfile);

/**
 * PUT /api/users/me/avatar
 * Update user avatar (multipart/form-data)
 */
router.put(
  '/me/avatar',
  authenticate,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            res.status(400).json({
              message: 'File too large. Maximum size is 5MB.',
            });
            return;
          }
          res.status(400).json({
            message: err.message,
          });
          return;
        }
        // Handle file filter errors
        res.status(400).json({
          message: err.message || 'File upload error',
        });
        return;
      }
      next();
    });
  },
  userController.updateAvatar
);

/**
 * GET /api/users/payments
 * Get user payments
 */
router.get('/payments', authenticate, userController.getPayments);

/**
 * GET /api/users/history
 * Get user parking history
 */
router.get('/history', authenticate, userController.getHistory);

export default router;
