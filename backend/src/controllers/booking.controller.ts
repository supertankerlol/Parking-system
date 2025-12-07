import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';

/**
 * Create a new booking
 * POST /api/bookings
 * Body: { spotId, startTime, endTime }
 * Protected by authentication
 */
export async function createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const { spotId, startTime, endTime } = req.body;

    // Validate required fields
    if (!spotId) {
      res.status(400).json({
        message: 'Spot ID is required',
      });
      return;
    }

    if (!startTime) {
      res.status(400).json({
        message: 'Start time is required',
      });
      return;
    }

    if (!endTime) {
      res.status(400).json({
        message: 'End time is required',
      });
      return;
    }

    const booking = await bookingService.createBooking(
      req.user.id,
      spotId,
      startTime,
      endTime
    );

    res.status(201).json({
      booking,
      message: 'Booking created successfully',
    });
  } catch (error: any) {
    // Handle specific error messages
    if (
      error.message === 'Spot not found' ||
      error.message === 'End time must be after start time' ||
      error.message === 'Start time cannot be in the past' ||
      error.message.includes('cannot be booked') ||
      error.message.includes('already booked')
    ) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }
    next(error);
  }
}

/**
 * Get user's bookings
 * GET /api/bookings
 * Protected by authentication
 */
export async function getUserBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        message: 'Unauthorized',
      });
      return;
    }

    const bookings = await bookingService.getUserBookings(req.user.id);

    res.status(200).json({
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    next(error);
  }
}
