import { PrismaClient } from '@prisma/client';
import { prisma } from '../repositories/prisma.client';
import { emitSpotUpdate } from '../sockets/socket';

// Type for Prisma transaction client
type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// Types
export interface CreateBookingInput {
  userId: string;
  spotId: string;
  startTime: Date | string;
  endTime: Date | string;
}

export interface BookingFilters {
  userId?: string;
  spotId?: string;
  status?: string;
  startTimeFrom?: Date | string;
  startTimeTo?: Date | string;
  page?: number;
  limit?: number;
}

export interface BookingWithRelations {
  id: string;
  userId: string;
  spotId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  baseCost: number | null;
  discountAmount: number;
  totalCost: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
  };
  spot?: {
    id: string;
    name: string;
    status: string;
    hourlyRate: number;
    garage?: {
      id: string;
      name: string;
      address: string;
    };
  };
}

/**
 * Check if there are overlapping bookings for a spot
 * @param spotId - Spot ID
 * @param startTime - Booking start time
 * @param endTime - Booking end time
 * @param excludeBookingId - Optional booking ID to exclude from check (for updates)
 * @returns Promise<boolean> - true if there's an overlap, false otherwise
 */
async function hasOverlappingBooking(
  spotId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const where: any = {
    spotId,
    status: {
      in: ['pending', 'confirmed', 'in_progress'],
    },
    OR: [
      // Overlap: existing booking starts before new booking ends and ends after new booking starts
      {
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
      },
    ],
  };

  if (excludeBookingId) {
    where.id = {
      not: excludeBookingId,
    };
  }

  const overlappingBooking = await prisma.booking.findFirst({
    where,
  });

  return overlappingBooking !== null;
}

/**
 * Calculate booking cost based on duration and spot hourly rate
 * @param startTime - Booking start time
 * @param endTime - Booking end time
 * @param hourlyRate - Spot hourly rate
 * @returns number - Calculated cost
 */
function calculateCost(startTime: Date, endTime: Date, hourlyRate: number): number {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
  return durationHours * hourlyRate;
}

/**
 * Create a new booking
 * @param userId - User ID
 * @param spotId - Spot ID
 * @param startTime - Booking start time (Date or string)
 * @param endTime - Booking end time (Date or string)
 * @returns Promise<BookingWithRelations> - Created booking
 * @throws Error if spot not found, spot not available, or overlapping booking exists
 */
export async function createBooking(
  userId: string,
  spotId: string,
  startTime: Date | string,
  endTime: Date | string
): Promise<BookingWithRelations> {
  // Convert times to Date objects
  const startDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const endDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

  // Validate time range
  if (startDate >= endDate) {
    throw new Error('End time must be after start time');
  }

  if (startDate < new Date()) {
    throw new Error('Start time cannot be in the past');
  }

  // Get spot with garage info
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
    },
  });

  if (!spot) {
    throw new Error('Spot not found');
  }

  // Check spot status
  if (spot.status === 'offline' || spot.status === 'maintenance') {
    throw new Error(`Spot is ${spot.status} and cannot be booked`);
  }

  // Check for overlapping bookings
  const hasOverlap = await hasOverlappingBooking(spotId, startDate, endDate);
  if (hasOverlap) {
    throw new Error('Spot is already booked for the requested time period');
  }

  // Calculate cost
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
  const baseCost = durationHours * spot.hourlyRate;
  const totalCost = baseCost - 0; // discountAmount defaults to 0

  // Create booking in a transaction
  const booking = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    // Create booking record
    const newBooking = await tx.booking.create({
      data: {
        userId,
        spotId,
        startTime: startDate,
        endTime: endDate,
        status: 'confirmed', // Can be changed to 'pending' if payment required
        baseCost,
        discountAmount: 0,
        totalCost,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        spot: {
          select: {
            id: true,
            name: true,
            status: true,
            hourlyRate: true,
            garage: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    });

    // Update spot status to 'reserved'
    const now = new Date();
    await tx.spot.update({
      where: { id: spotId },
      data: {
        status: 'reserved',
        lastSeenAt: now,
      },
    });

    // Insert parking_history event
    await tx.parkingHistory.create({
      data: {
        userId,
        spotId,
        garageId: spot.garageId,
        eventType: 'booked',
        sourceType: 'manual',
        metadata: {
          bookingId: newBooking.id,
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
        },
        timestamp: now,
      },
    });

    return newBooking;
  });

  // Emit socket event for spot update
  emitSpotUpdate({
    spotId,
    status: 'reserved',
    lastSeenAt: new Date(),
  });

  return booking as BookingWithRelations;
}

/**
 * Get bookings for a specific user
 * @param userId - User ID
 * @returns Promise<BookingWithRelations[]> - List of user bookings
 */
export async function getUserBookings(userId: string): Promise<BookingWithRelations[]> {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      spot: {
        select: {
          id: true,
          name: true,
          status: true,
          hourlyRate: true,
          garage: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
    },
    orderBy: {
      startTime: 'desc',
    },
  });

  return bookings as BookingWithRelations[];
}

/**
 * Get all bookings with optional filters (admin function)
 * @param filters - Filter options
 * @returns Promise<{ bookings: BookingWithRelations[]; total: number; page: number; limit: number; totalPages: number }> - Paginated bookings
 */
export async function adminGetBookings(filters: BookingFilters = {}): Promise<{
  bookings: BookingWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const {
    userId,
    spotId,
    status,
    startTimeFrom,
    startTimeTo,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (spotId) {
    where.spotId = spotId;
  }

  if (status) {
    where.status = status;
  }

  if (startTimeFrom || startTimeTo) {
    where.startTime = {};
    if (startTimeFrom) {
      const fromDate = typeof startTimeFrom === 'string' ? new Date(startTimeFrom) : startTimeFrom;
      where.startTime.gte = fromDate;
    }
    if (startTimeTo) {
      const toDate = typeof startTimeTo === 'string' ? new Date(startTimeTo) : startTimeTo;
      where.startTime.lte = toDate;
    }
  }

  // Get total count
  const total = await prisma.booking.count({ where });

  // Get bookings with pagination
  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      spot: {
        select: {
          id: true,
          name: true,
          status: true,
          hourlyRate: true,
          garage: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
    },
    skip,
    take: limit,
    orderBy: {
      startTime: 'desc',
    },
  });

  return {
    bookings: bookings as BookingWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
