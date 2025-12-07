import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * POST /api/bookings
 * Create a new booking
 * Body: { spotId, startTime, endTime }
 * Protected by authentication
 */
router.post('/', authenticate, bookingController.createBooking);

/**
 * GET /api/bookings
 * Get current user's bookings
 * Protected by authentication
 */
router.get('/', authenticate, bookingController.getUserBookings);

export default router;
