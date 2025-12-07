import { prisma } from '../repositories/prisma.client';
import { PrismaClient } from '@prisma/client';

// Type for Prisma transaction client
type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

// ════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════

export interface CreateGarageInput {
  name: string;
  address: string;
  city?: string;
  lat?: number;
  lng?: number;
  type?: 'outdoor' | 'indoor' | 'mixed';
  status?: 'active' | 'closed' | 'maintenance';
}

export interface UpdateGarageInput {
  name?: string;
  address?: string;
  city?: string;
  lat?: number;
  lng?: number;
  type?: 'outdoor' | 'indoor' | 'mixed';
  status?: 'active' | 'closed' | 'maintenance';
  totalSpots?: number;
}

export interface CreateFloorInput {
  garageId: string;
  name: string;
  label: string;
  rows?: number;
  columns?: number;
  totalSpots?: number;
}

export interface UpdateFloorInput {
  name?: string;
  label?: string;
  rows?: number;
  columns?: number;
  totalSpots?: number;
}

export interface CreateSpotInput {
  garageId: string;
  floorId?: string;
  name: string;
  description?: string;
  row?: number;
  column?: number;
  lat?: number;
  lng?: number;
  status?: 'available' | 'occupied' | 'reserved' | 'offline' | 'maintenance';
  hourlyRate?: number;
  dayRate?: number;
  earlyBirdRate?: number;
  minimumDuration?: number;
}

export interface UpdateSpotInput {
  name?: string;
  description?: string;
  row?: number;
  column?: number;
  lat?: number;
  lng?: number;
  status?: 'available' | 'occupied' | 'reserved' | 'offline' | 'maintenance';
  hourlyRate?: number;
  dayRate?: number;
  earlyBirdRate?: number;
  minimumDuration?: number;
  floorId?: string;
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

export interface DashboardStats {
  spotStatusCounts: {
    available: number;
    occupied: number;
    reserved: number;
    offline: number;
    maintenance: number;
  };
  activeReservations: number;
  recentHistory: Array<{
    id: string;
    userId: string | null;
    spotId: string;
    garageId: string;
    eventType: string;
    sourceType: string;
    metadata: any;
    timestamp: Date;
    createdAt: Date;
    user?: {
      id: string;
      fullName: string;
      email: string;
    } | null;
    spot?: {
      id: string;
      name: string;
      garage?: {
        id: string;
        name: string;
      };
    } | null;
  }>;
}

// ════════════════════════════════════════════════════════════
// GARAGE OPERATIONS
// ════════════════════════════════════════════════════════════

/**
 * Create a new garage
 * @param data - Garage data
 * @returns Promise<any> - Created garage
 * @throws Error if validation fails
 */
export async function createGarage(data: CreateGarageInput): Promise<any> {
  // Validate required fields
  if (!data.name || !data.address) {
    throw new Error('Name and address are required');
  }

  // Create garage
  const garage = await prisma.garage.create({
    data: {
      name: data.name,
      address: data.address,
      city: data.city || 'Almaty',
      lat: data.lat,
      lng: data.lng,
      type: data.type || 'mixed',
      status: data.status || 'active',
      totalSpots: 0,
    },
  });

  return garage;
}

/**
 * Update an existing garage
 * @param id - Garage ID
 * @param data - Update data
 * @returns Promise<any> - Updated garage
 * @throws Error if garage not found
 */
export async function updateGarage(id: string, data: UpdateGarageInput): Promise<any> {
  // Check if garage exists
  const existingGarage = await prisma.garage.findUnique({
    where: { id },
  });

  if (!existingGarage) {
    throw new Error('Garage not found');
  }

  // Update garage
  const updatedGarage = await prisma.garage.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.address && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.lat !== undefined && { lat: data.lat }),
      ...(data.lng !== undefined && { lng: data.lng }),
      ...(data.type && { type: data.type }),
      ...(data.status && { status: data.status }),
      ...(data.totalSpots !== undefined && { totalSpots: data.totalSpots }),
    },
  });

  return updatedGarage;
}

/**
 * Soft delete a garage (set status to 'closed')
 * @param id - Garage ID
 * @returns Promise<any> - Updated garage
 * @throws Error if garage not found
 */
export async function softDeleteGarage(id: string): Promise<any> {
  // Check if garage exists
  const existingGarage = await prisma.garage.findUnique({
    where: { id },
  });

  if (!existingGarage) {
    throw new Error('Garage not found');
  }

  // Soft delete by setting status to 'closed'
  const updatedGarage = await prisma.garage.update({
    where: { id },
    data: {
      status: 'closed',
    },
  });

  return updatedGarage;
}

// ════════════════════════════════════════════════════════════
// FLOOR OPERATIONS
// ════════════════════════════════════════════════════════════

/**
 * Create a new floor
 * @param data - Floor data
 * @returns Promise<any> - Created floor
 * @throws Error if garage not found or validation fails
 */
export async function createFloor(data: CreateFloorInput): Promise<any> {
  // Validate required fields
  if (!data.garageId || !data.name || !data.label) {
    throw new Error('Garage ID, name, and label are required');
  }

  // Check if garage exists
  const garage = await prisma.garage.findUnique({
    where: { id: data.garageId },
  });

  if (!garage) {
    throw new Error('Garage not found');
  }

  // Check if floor with same name already exists in this garage
  const existingFloor = await prisma.floor.findUnique({
    where: {
      garageId_name: {
        garageId: data.garageId,
        name: data.name,
      },
    },
  });

  if (existingFloor) {
    throw new Error(`Floor with name "${data.name}" already exists in this garage`);
  }

  // Create floor
  const floor = await prisma.floor.create({
    data: {
      garageId: data.garageId,
      name: data.name,
      label: data.label,
      rows: data.rows || 0,
      columns: data.columns || 0,
      totalSpots: data.totalSpots || 0,
    },
  });

  return floor;
}

/**
 * Update an existing floor
 * @param id - Floor ID
 * @param data - Update data
 * @returns Promise<any> - Updated floor
 * @throws Error if floor not found
 */
export async function updateFloor(id: string, data: UpdateFloorInput): Promise<any> {
  // Check if floor exists
  const existingFloor = await prisma.floor.findUnique({
    where: { id },
  });

  if (!existingFloor) {
    throw new Error('Floor not found');
  }

  // If name is being updated, check for uniqueness
  if (data.name && data.name !== existingFloor.name) {
    const duplicateFloor = await prisma.floor.findUnique({
      where: {
        garageId_name: {
          garageId: existingFloor.garageId,
          name: data.name,
        },
      },
    });

    if (duplicateFloor) {
      throw new Error(`Floor with name "${data.name}" already exists in this garage`);
    }
  }

  // Update floor
  const updatedFloor = await prisma.floor.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.label && { label: data.label }),
      ...(data.rows !== undefined && { rows: data.rows }),
      ...(data.columns !== undefined && { columns: data.columns }),
      ...(data.totalSpots !== undefined && { totalSpots: data.totalSpots }),
    },
  });

  return updatedFloor;
}

/**
 * Delete a floor (hard delete)
 * @param id - Floor ID
 * @returns Promise<any> - Deleted floor
 * @throws Error if floor not found
 */
export async function deleteFloor(id: string): Promise<any> {
  // Check if floor exists
  const existingFloor = await prisma.floor.findUnique({
    where: { id },
  });

  if (!existingFloor) {
    throw new Error('Floor not found');
  }

  // Delete floor (cascade will handle spots)
  const deletedFloor = await prisma.floor.delete({
    where: { id },
  });

  return deletedFloor;
}

// ════════════════════════════════════════════════════════════
// SPOT OPERATIONS
// ════════════════════════════════════════════════════════════

/**
 * Create a new parking spot
 * @param data - Spot data
 * @returns Promise<any> - Created spot
 * @throws Error if garage not found or validation fails
 */
export async function createSpot(data: CreateSpotInput): Promise<any> {
  // Validate required fields
  if (!data.garageId || !data.name) {
    throw new Error('Garage ID and name are required');
  }

  // Check if garage exists
  const garage = await prisma.garage.findUnique({
    where: { id: data.garageId },
  });

  if (!garage) {
    throw new Error('Garage not found');
  }

  // If floorId is provided, check if floor exists
  if (data.floorId) {
    const floor = await prisma.floor.findUnique({
      where: { id: data.floorId },
    });

    if (!floor) {
      throw new Error('Floor not found');
    }

    if (floor.garageId !== data.garageId) {
      throw new Error('Floor does not belong to the specified garage');
    }
  }

  // If row and column are provided, check for uniqueness
  if (data.floorId && data.row !== undefined && data.column !== undefined) {
    const existingSpot = await prisma.spot.findFirst({
      where: {
        garageId: data.garageId,
        floorId: data.floorId,
        row: data.row,
        column: data.column,
      },
    });

    if (existingSpot) {
      throw new Error('A spot already exists at this grid position');
    }
  }

  // Generate spot ID if not provided (using name or generating one)
  const spotId = `${data.garageId}-${data.floorId || 'root'}-${data.name}`;

  // Create spot in transaction
  const spot = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const newSpot = await tx.spot.create({
      data: {
        id: spotId,
        garageId: data.garageId,
        floorId: data.floorId,
        name: data.name,
        description: data.description,
        row: data.row,
        column: data.column,
        lat: data.lat,
        lng: data.lng,
        status: data.status || 'available',
        hourlyRate: data.hourlyRate || 1.5,
        dayRate: data.dayRate || 12.0,
        earlyBirdRate: data.earlyBirdRate || 10.0,
        minimumDuration: data.minimumDuration || 15,
      },
    });

    // Update garage totalSpots count
    await tx.garage.update({
      where: { id: data.garageId },
      data: {
        totalSpots: {
          increment: 1,
        },
      },
    });

    // Update floor totalSpots count if floorId is provided
    if (data.floorId) {
      await tx.floor.update({
        where: { id: data.floorId },
        data: {
          totalSpots: {
            increment: 1,
          },
        },
      });
    }

    return newSpot;
  });

  return spot;
}

/**
 * Update an existing parking spot
 * @param id - Spot ID
 * @param data - Update data
 * @returns Promise<any> - Updated spot
 * @throws Error if spot not found
 */
export async function updateSpot(id: string, data: UpdateSpotInput): Promise<any> {
  // Check if spot exists
  const existingSpot = await prisma.spot.findUnique({
    where: { id },
  });

  if (!existingSpot) {
    throw new Error('Spot not found');
  }

  // If floorId, row, or column are being updated, check for uniqueness
  if (data.floorId || data.row !== undefined || data.column !== undefined) {
    const floorId = data.floorId || existingSpot.floorId;
    const row = data.row !== undefined ? data.row : existingSpot.row;
    const column = data.column !== undefined ? data.column : existingSpot.column;

    if (floorId && row !== null && column !== null) {
      const existingSpotAtPosition = await prisma.spot.findFirst({
        where: {
          garageId: existingSpot.garageId,
          floorId: floorId,
          row: row,
          column: column,
          id: {
            not: id,
          },
        },
      });

      if (existingSpotAtPosition) {
        throw new Error('A spot already exists at this grid position');
      }
    }
  }

  // Update spot
  const updatedSpot = await prisma.spot.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.row !== undefined && { row: data.row }),
      ...(data.column !== undefined && { column: data.column }),
      ...(data.lat !== undefined && { lat: data.lat }),
      ...(data.lng !== undefined && { lng: data.lng }),
      ...(data.status && { status: data.status }),
      ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
      ...(data.dayRate !== undefined && { dayRate: data.dayRate }),
      ...(data.earlyBirdRate !== undefined && { earlyBirdRate: data.earlyBirdRate }),
      ...(data.minimumDuration !== undefined && { minimumDuration: data.minimumDuration }),
      ...(data.floorId !== undefined && { floorId: data.floorId }),
    },
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      floor: {
        select: {
          id: true,
          name: true,
          label: true,
        },
      },
    },
  });

  return updatedSpot;
}

/**
 * Change spot status
 * @param id - Spot ID
 * @param status - New status
 * @returns Promise<any> - Updated spot
 * @throws Error if spot not found or invalid status
 */
export async function changeSpotStatus(
  id: string,
  status: 'available' | 'occupied' | 'reserved' | 'offline' | 'maintenance'
): Promise<any> {
  const validStatuses = ['available', 'occupied', 'reserved', 'offline', 'maintenance'];

  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Check if spot exists
  const existingSpot = await prisma.spot.findUnique({
    where: { id },
  });

  if (!existingSpot) {
    throw new Error('Spot not found');
  }

  // Update spot status
  const updatedSpot = await prisma.spot.update({
    where: { id },
    data: {
      status,
      lastSeenAt: status === 'occupied' ? new Date() : existingSpot.lastSeenAt,
    },
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          address: true,
        },
      },
      floor: {
        select: {
          id: true,
          name: true,
          label: true,
        },
      },
    },
  });

  return updatedSpot;
}

/**
 * Delete a parking spot (hard delete)
 * @param id - Spot ID
 * @returns Promise<any> - Deleted spot
 * @throws Error if spot not found
 */
export async function deleteSpot(id: string): Promise<any> {
  // Check if spot exists
  const existingSpot = await prisma.spot.findUnique({
    where: { id },
  });

  if (!existingSpot) {
    throw new Error('Spot not found');
  }

  // Delete spot in transaction
  const deletedSpot = await prisma.$transaction(async (tx: PrismaTransactionClient) => {
    const spot = await tx.spot.delete({
      where: { id },
    });

    // Update garage totalSpots count
    await tx.garage.update({
      where: { id: existingSpot.garageId },
      data: {
        totalSpots: {
          decrement: 1,
        },
      },
    });

    // Update floor totalSpots count if floorId exists
    if (existingSpot.floorId) {
      await tx.floor.update({
        where: { id: existingSpot.floorId },
        data: {
          totalSpots: {
            decrement: 1,
          },
        },
      });
    }

    return spot;
  });

  return deletedSpot;
}

// ════════════════════════════════════════════════════════════
// BOOKING OPERATIONS
// ════════════════════════════════════════════════════════════

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

// ════════════════════════════════════════════════════════════
// DASHBOARD OPERATIONS
// ════════════════════════════════════════════════════════════

/**
 * Get admin dashboard statistics
 * @returns Promise<DashboardStats> - Dashboard statistics including spot status counts, active reservations, and recent history
 */
export async function adminDashboard(): Promise<DashboardStats> {
  // Get spot status counts using Prisma aggregation
  const spotStatusCounts = await prisma.spot.groupBy({
    by: ['status'],
    _count: {
      id: true,
    },
  });

  // Convert to object format
  const statusCounts = {
    available: 0,
    occupied: 0,
    reserved: 0,
    offline: 0,
    maintenance: 0,
  };

  spotStatusCounts.forEach((item: { status: string; _count: { id: number } }) => {
    const status = item.status as keyof typeof statusCounts;
    if (status in statusCounts) {
      statusCounts[status] = item._count.id;
    }
  });

  // Get active reservations count (bookings with status 'confirmed' or 'in_progress')
  const activeReservations = await prisma.booking.count({
    where: {
      status: {
        in: ['confirmed', 'in_progress'],
      },
    },
  });

  // Get recent parking history (last 20)
  const recentHistory = await prisma.parkingHistory.findMany({
    take: 20,
    orderBy: {
      timestamp: 'desc',
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
          garage: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return {
    spotStatusCounts: statusCounts,
    activeReservations,
    recentHistory: recentHistory as DashboardStats['recentHistory'],
  };
}
