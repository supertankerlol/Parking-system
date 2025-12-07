import { prisma } from '../repositories/prisma.client';
import { getMockGarageData, MockGarageData, MockFloor, MockSpot } from '../data/garages.mock';

// Types
export interface GetSpotsQuery {
  lat?: number;
  lng?: number;
  radius?: number; // in kilometers
  page?: number;
  limit?: number;
  status?: string;
  garageId?: string;
}

export interface GetSpotsResult {
  spots: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GarageWithFloors {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number | null;
  lng: number | null;
  type: string;
  status: string;
  totalSpots: number;
  floors: Array<{
    id: string;
    name: string;
    label: string;
    rows: number;
    columns: number;
    totalSpots: number;
    spots: any[];
  }>;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get parking spots with optional filtering by location
 * @param query - Query parameters (lat, lng, radius, page, limit, status, garageId)
 * @returns Promise<GetSpotsResult> - List of spots with pagination
 */
export async function getSpots(query: GetSpotsQuery = {}): Promise<GetSpotsResult> {
  const {
    lat,
    lng,
    radius = 5, // default 5km radius
    page = 1,
    limit = 20,
    status,
    garageId,
  } = query;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (garageId) {
    where.garageId = garageId;
  }

  // If lat/lng provided, we'll filter by garage location first
  if (lat !== undefined && lng !== undefined) {
    // First, get all garages within radius
    const allGarages = await prisma.garage.findMany({
      where: {
        lat: { not: null },
        lng: { not: null },
        status: 'active',
      },
      select: {
        id: true,
        lat: true,
        lng: true,
      },
    });

    // Filter garages by distance
    const nearbyGarageIds = allGarages
      .filter((garage: { id: string; lat: number | null; lng: number | null }) => {
        if (!garage.lat || !garage.lng) return false;
        const distance = calculateDistance(lat, lng, garage.lat, garage.lng);
        return distance <= radius;
      })
      .map((garage: { id: string; lat: number | null; lng: number | null }) => garage.id);

    if (nearbyGarageIds.length === 0) {
      return {
        spots: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    where.garageId = { in: nearbyGarageIds };
  }

  // Get total count
  const total = await prisma.spot.count({ where });

  // Get spots with pagination
  const spots = await prisma.spot.findMany({
    where,
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          lat: true,
          lng: true,
          type: true,
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
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    spots,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get parking spot by ID
 * @param spotId - Spot ID
 * @returns Promise<any> - Spot data with garage and floor info
 * @throws Error if spot not found
 */
export async function getSpotById(spotId: string): Promise<any> {
  const spot = await prisma.spot.findUnique({
    where: { id: spotId },
    include: {
      garage: {
        select: {
          id: true,
          name: true,
          address: true,
          city: true,
          lat: true,
          lng: true,
          type: true,
          status: true,
        },
      },
      floor: {
        select: {
          id: true,
          name: true,
          label: true,
          rows: true,
          columns: true,
        },
      },
    },
  });

  if (!spot) {
    throw new Error('Spot not found');
  }

  return spot;
}

/**
 * Get garage data with floors and spots
 * Returns mock data if no real DB floors exist for indoor garages
 * @param garageId - Garage ID
 * @returns Promise<GarageWithFloors> - Garage data with floors and spots
 * @throws Error if garage not found
 */
export async function getGarage(garageId: string): Promise<GarageWithFloors> {
  // Get garage from DB
  const garage = await prisma.garage.findUnique({
    where: { id: garageId },
    include: {
      floors: {
        include: {
          spots: {
            orderBy: [
              { row: 'asc' },
              { column: 'asc' },
            ],
          },
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!garage) {
    throw new Error('Garage not found');
  }

  // If garage has floors in DB, return real data
  if (garage.floors && garage.floors.length > 0) {
    return {
      id: garage.id,
      name: garage.name,
      address: garage.address,
      city: garage.city,
      lat: garage.lat,
      lng: garage.lng,
      type: garage.type,
      status: garage.status,
      totalSpots: garage.totalSpots,
      floors: garage.floors.map((floor: { id: string; name: string; label: string; rows: number; columns: number; totalSpots: number; spots: any[] }) => ({
        id: floor.id,
        name: floor.name,
        label: floor.label,
        rows: floor.rows,
        columns: floor.columns,
        totalSpots: floor.totalSpots,
        spots: floor.spots,
      })),
    };
  }

  // If no floors exist and it's an indoor/mixed garage, use mock data
  if (garage.type === 'indoor' || garage.type === 'mixed') {
    const mockData = getMockGarageData(garageId);
    if (mockData) {
      return {
        id: garage.id,
        name: garage.name,
        address: garage.address,
        city: garage.city,
        lat: garage.lat,
        lng: garage.lng,
        type: garage.type,
        status: garage.status,
        totalSpots: garage.totalSpots || mockData.floors.reduce((sum: number, f: typeof mockData.floors[number]) => sum + f.totalSpots, 0),
        floors: mockData.floors.map((floor: typeof mockData.floors[number]) => ({
          id: floor.id,
          name: floor.name,
          label: floor.label,
          rows: floor.rows,
          columns: floor.columns,
          totalSpots: floor.totalSpots,
          spots: floor.spots.map((spot: typeof floor.spots[number]) => ({
            id: spot.id,
            name: spot.name,
            row: spot.row,
            column: spot.column,
            status: spot.status,
            garageId: garage.id,
            floorId: floor.id,
            description: null,
            lat: null,
            lng: null,
            lastSeenAt: null,
            lastOccupiedBy: null,
            hourlyRate: 1.5,
            dayRate: 12.0,
            earlyBirdRate: 10.0,
            minimumDuration: 15,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
        })),
      };
    }
  }

  // Return garage with empty floors array if no mock data available
  return {
    id: garage.id,
    name: garage.name,
    address: garage.address,
    city: garage.city,
    lat: garage.lat,
    lng: garage.lng,
    type: garage.type,
    status: garage.status,
    totalSpots: garage.totalSpots,
    floors: [],
  };
}

/**
 * Update parking spot status
 * @param spotId - Spot ID
 * @param status - New status ("available" | "occupied" | "reserved" | "offline" | "maintenance")
 * @returns Promise<any> - Updated spot data
 * @throws Error if spot not found or invalid status
 */
export async function updateSpotStatus(spotId: string, status: string): Promise<any> {
  const validStatuses = ['available', 'occupied', 'reserved', 'offline', 'maintenance'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Check if spot exists
  const existingSpot = await prisma.spot.findUnique({
    where: { id: spotId },
  });

  if (!existingSpot) {
    throw new Error('Spot not found');
  }

  // Update spot status
  const updatedSpot = await prisma.spot.update({
    where: { id: spotId },
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
