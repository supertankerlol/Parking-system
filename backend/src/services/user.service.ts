import { prisma } from '../repositories/prisma.client';

// Types
export interface UserWithoutPassword {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  defaultLicense: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  defaultLicense?: string;
}

export interface PaymentWithBooking {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  bookingId: string;
  booking: {
    id: string;
    spotId: string;
    spot: {
      id: string;
      name: string;
      garageId: string;
      garage: {
        id: string;
        name: string;
        address: string;
      };
    };
    startTime: Date;
    endTime: Date;
    status: string;
    totalCost: number | null;
  };
  receiptUrl: string | null;
  transactionId: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingHistoryWithSpot {
  id: string;
  spotId: string;
  spot: {
    id: string;
    name: string;
    garageId: string;
    garage: {
      id: string;
      name: string;
      address: string;
    };
  };
  eventType: string;
  sourceType: string;
  metadata: any;
  timestamp: Date;
  createdAt: Date;
}

/**
 * Get user by ID
 * @param userId - User ID
 * @returns Promise<UserWithoutPassword> - User data without password
 * @throws Error if user not found
 */
export async function getUserById(userId: string): Promise<UserWithoutPassword> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      defaultLicense: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Update user profile
 * @param userId - User ID
 * @param data - Profile data to update
 * @returns Promise<UserWithoutPassword> - Updated user data
 * @throws Error if user not found
 */
export async function updateProfile(
  userId: string,
  data: UpdateProfileData
): Promise<UserWithoutPassword> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.phone !== undefined && { phone: data.phone || null }),
      ...(data.defaultLicense !== undefined && {
        defaultLicense: data.defaultLicense || null,
      }),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      defaultLicense: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

/**
 * Update user avatar
 * @param userId - User ID
 * @param avatarUrl - URL or path to the avatar file
 * @returns Promise<UserWithoutPassword> - Updated user data
 * @throws Error if user not found
 */
export async function updateAvatar(
  userId: string,
  avatarUrl: string
): Promise<UserWithoutPassword> {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Update avatar URL
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      avatarUrl: true,
      defaultLicense: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updatedUser;
}

/**
 * Get user payments with booking details
 * @param userId - User ID
 * @returns Promise<PaymentWithBooking[]> - List of payments
 */
export async function getPayments(userId: string): Promise<PaymentWithBooking[]> {
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      booking: {
        include: {
          spot: {
            include: {
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
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  type PaymentWithIncludes = typeof payments[number];
  return payments.map((payment: PaymentWithIncludes) => ({
    id: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    method: payment.method,
    status: payment.status,
    bookingId: payment.bookingId,
    booking: {
      id: payment.booking.id,
      spotId: payment.booking.spotId,
      spot: {
        id: payment.booking.spot.id,
        name: payment.booking.spot.name,
        garageId: payment.booking.spot.garageId,
        garage: payment.booking.spot.garage,
      },
      startTime: payment.booking.startTime,
      endTime: payment.booking.endTime,
      status: payment.booking.status,
      totalCost: payment.booking.totalCost,
    },
    receiptUrl: payment.receiptUrl,
    transactionId: payment.transactionId,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }));
}

/**
 * Get user parking history
 * @param userId - User ID
 * @returns Promise<ParkingHistoryWithSpot[]> - List of parking history entries
 */
export async function getHistory(userId: string): Promise<ParkingHistoryWithSpot[]> {
  const history = await prisma.parkingHistory.findMany({
    where: { userId },
    include: {
      spot: {
        include: {
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
      timestamp: 'desc',
    },
  });

  type HistoryWithIncludes = typeof history[number];
  return history.map((entry: HistoryWithIncludes) => ({
    id: entry.id,
    spotId: entry.spotId,
    spot: {
      id: entry.spot.id,
      name: entry.spot.name,
      garageId: entry.spot.garageId,
      garage: entry.spot.garage,
    },
    eventType: entry.eventType,
    sourceType: entry.sourceType,
    metadata: entry.metadata,
    timestamp: entry.timestamp,
    createdAt: entry.createdAt,
  }));
}
