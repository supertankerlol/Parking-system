import { Request, Response, NextFunction } from 'express';
import * as paymentService from '../services/payment.service';

/**
 * Process a payment for a booking
 * POST /api/payments
 * Body: { bookingId, amount, paymentMethod, cardDetails? }
 * Protected by authentication (handled in routes)
 */
export async function processPayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { bookingId, amount, paymentMethod, cardDetails } = req.body || {};

    const payment = await paymentService.processPaymentForBooking({
      userId: req.user.id,
      bookingId,
      amount,
      paymentMethod,
      cardDetails,
    });

    res.status(200).json({
      payment,
      message: 'Payment processed successfully',
    });
  } catch (error: any) {
    // Known validation errors should return 400 instead of 500
    const knownMessages = [
      'Booking ID is required',
      'Payment amount must be greater than zero',
      'Payment method is required',
      'Booking not found',
      'Booking is already paid',
      'Invalid payment amount',
    ];

    if (knownMessages.includes(error?.message)) {
      res.status(400).json({ message: error.message });
      return;
    }

    next(error);
  }
}


