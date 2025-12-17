import { prisma } from '../repositories/prisma.client';

export interface ProcessPaymentInput {
  userId: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  cardDetails?: any;
}

/**
 * Process a payment for a booking.
 * - Validates booking ownership and status
 * - Ensures amount matches booking total (with small tolerance)
 * - Creates or updates a Payment record
 * - Marks booking as confirmed (or keeps as is if already progressed)
 */
export async function processPaymentForBooking(input: ProcessPaymentInput) {
  const { userId, bookingId, amount, paymentMethod, cardDetails } = input;

  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  if (!amount || amount <= 0) {
    throw new Error('Payment amount must be greater than zero');
  }

  if (!paymentMethod) {
    throw new Error('Payment method is required');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      payment: true,
    },
  });

  if (!booking || booking.userId !== userId) {
    throw new Error('Booking not found');
  }

  // If already has a completed payment, do not charge again
  if (booking.payment && booking.payment.status === 'completed') {
    throw new Error('Booking is already paid');
  }

  const expectedAmount = booking.totalCost ?? booking.baseCost ?? 0;

  if (expectedAmount > 0) {
    const tolerance = 0.01;
    if (Math.abs(expectedAmount - amount) > tolerance) {
      throw new Error('Invalid payment amount');
    }
  }

  const now = new Date();

  // Upsert payment so retries don't create duplicates
  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      amount,
      method: paymentMethod,
      status: 'completed',
      paidAt: now,
      // Keep existing transactionId / receipt if already set, otherwise generate a simple demo ID
      transactionId:
        booking.payment?.transactionId ?? `demo-${bookingId}-${Date.now()}`,
    },
    create: {
      userId,
      bookingId,
      amount,
      method: paymentMethod,
      status: 'completed',
      paidAt: now,
      transactionId: `demo-${bookingId}-${Date.now()}`,
      // currency defaults to "KZT" via schema
    },
  });

  // Mark booking as confirmed if it was still pending
  if (booking.status === 'pending') {
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
      },
    });
  }

  return payment;
}


