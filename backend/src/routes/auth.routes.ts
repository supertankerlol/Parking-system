import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', authController.signup);

/**
 * POST /api/auth/login
 * Login a user
 */
router.post('/login', authController.login);

/**
 * POST /api/auth/logout
 * Logout a user (requires authentication)
 */
router.post('/logout', authenticate, authController.logout);

export default router;
