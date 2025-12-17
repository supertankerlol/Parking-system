import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

/**
 * POST /api/payments
 * Process a payment for a booking.
 * Body: { bookingId, amount, paymentMethod, cardDetails? }
 * Protected by authentication
 */
router.post('/', authenticate, paymentController.processPayment);

export default router;


