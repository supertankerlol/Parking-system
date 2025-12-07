// Mock garage data for indoor parking garages
// Used when no real DB floors exist for a garage

export interface MockFloor {
  id: string;
  name: string;
  label: string;
  totalSpots: number;
  rows: number;
  columns: number;
  spots: MockSpot[];
}

export interface MockSpot {
  id: string;
  name: string;
  row: number;
  column: number;
  status: 'available' | 'occupied' | 'reserved' | 'offline' | 'maintenance';
}

export interface MockGarageData {
  id: string;
  name: string;
  address: string;
  floors: MockFloor[];
}

// Generate mock spots for a floor
function generateMockSpots(floorPrefix: string, rows: number, cols: number): MockSpot[] {
  const spots: MockSpot[] = [];
  const statuses: Array<'available' | 'occupied' | 'reserved'> = ['available', 'occupied', 'reserved'];
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const spotNumber = row * cols + col + 1;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      spots.push({
        id: `${floorPrefix}-${spotNumber}`,
        name: `#${spotNumber}`,
        row: row,
        column: col,
        status: randomStatus,
      });
    }
  }
  
  return spots;
}

// Mock garage data
export const mockGarages: Record<string, MockGarageData> = {
  'spot-1': {
    id: 'spot-1',
    name: 'Outdoor surface car park',
    address: '9 Corinthian Drive, Almaty',
    floors: [
      {
        id: 'b1',
        name: 'B1',
        label: 'Basement 1',
        totalSpots: 48,
        rows: 6,
        columns: 8,
        spots: generateMockSpots('B1', 6, 8),
      },
      {
        id: 'b2',
        name: 'B2',
        label: 'Basement 2',
        totalSpots: 48,
        rows: 6,
        columns: 8,
        spots: generateMockSpots('B2', 6, 8),
      },
    ],
  },
  'spot-2': {
    id: 'spot-2',
    name: 'Free Almaty Parks',
    address: '55 Corinthion Drive, Almaty',
    floors: [
      {
        id: '1',
        name: '1',
        label: 'Floor 1',
        totalSpots: 40,
        rows: 5,
        columns: 8,
        spots: generateMockSpots('1', 5, 8),
      },
    ],
  },
  'spot-3': {
    id: 'spot-3',
    name: '22 Corinthian Drive (Outdoor)',
    address: '22 Corinthian Drive, Almaty',
    floors: [
      {
        id: 'l1',
        name: 'L1',
        label: 'Level 1',
        totalSpots: 56,
        rows: 7,
        columns: 8,
        spots: generateMockSpots('L1', 7, 8),
      },
      {
        id: 'l2',
        name: 'L2',
        label: 'Level 2',
        totalSpots: 56,
        rows: 7,
        columns: 8,
        spots: generateMockSpots('L2', 7, 8),
      },
    ],
  },
  'spot-4': {
    id: 'spot-4',
    name: '22 Corinthian Drive (Indoor)',
    address: '22 Corinthian Drive, Almaty',
    floors: [
      {
        id: 'b1',
        name: 'B1',
        label: 'Basement 1',
        totalSpots: 64,
        rows: 8,
        columns: 8,
        spots: generateMockSpots('B1', 8, 8),
      },
      {
        id: 'b2',
        name: 'B2',
        label: 'Basement 2',
        totalSpots: 64,
        rows: 8,
        columns: 8,
        spots: generateMockSpots('B2', 8, 8),
      },
    ],
  },
};

/**
 * Get mock garage data by garage ID
 * @param garageId - Garage ID
 * @returns Mock garage data or null if not found
 */
export function getMockGarageData(garageId: string): MockGarageData | null {
  return mockGarages[garageId] || null;
}
