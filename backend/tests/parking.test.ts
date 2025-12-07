import request from 'supertest';
import app from '../src/app';
import { prisma } from './setup';

describe('Parking API', () => {
  let garageId: string;
  let spotId: string;

  beforeAll(async () => {
    // Create test garage (similar to seed data structure)
    const garage = await prisma.garage.create({
      data: {
        name: 'Downtown Parking Center',
        address: 'Abay Avenue 150, Almaty',
        city: 'Almaty',
        lat: 43.238949,
        lng: 76.889709,
        type: 'indoor',
        status: 'active',
        totalSpots: 1,
      },
    });
    garageId = garage.id;

    // Create a test spot with ID similar to seed format (spot-1 or G1-B1-A01)
    // Using the first spot format from seed: G1-B1-A01
    const spot = await prisma.spot.create({
      data: {
        id: 'G1-B1-A01', // Matching seed format
        garageId: garage.id,
        name: 'A01',
        description: 'Basement 1, Row A, Column 1',
        row: 1,
        column: 1,
        status: 'available',
        hourlyRate: 1.50,
        dayRate: 12.00,
        earlyBirdRate: 10.00,
        minimumDuration: 15,
      },
    });
    spotId = spot.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.spot.deleteMany();
    await prisma.garage.deleteMany();
  });

  describe('GET /api/parking', () => {
    it('should return list of parking spots', async () => {
      const response = await request(app)
        .get('/api/parking')
        .expect(200);

      expect(response.body).toHaveProperty('spots');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('limit');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.spots)).toBe(true);
      expect(response.body.total).toBeGreaterThanOrEqual(1);
    });

    it('should return seeded spot data (G1-B1-A01)', async () => {
      const response = await request(app)
        .get('/api/parking')
        .expect(200);

      const spots = response.body.spots;
      const testSpot = spots.find((spot: any) => spot.id === 'G1-B1-A01');

      expect(testSpot).toBeDefined();
      expect(testSpot.id).toBe('G1-B1-A01');
      expect(testSpot.name).toBe('A01');
      expect(testSpot.status).toBe('available');
      expect(testSpot).toHaveProperty('garage');
      expect(testSpot.garage.id).toBe(garageId);
      expect(testSpot.garage.name).toBe('Downtown Parking Center');
    });

    it('should include garage information with spots', async () => {
      const response = await request(app)
        .get('/api/parking')
        .expect(200);

      const spots = response.body.spots;
      expect(spots.length).toBeGreaterThan(0);

      // Check that each spot has garage info
      spots.forEach((spot: any) => {
        expect(spot).toHaveProperty('garage');
        expect(spot.garage).toHaveProperty('id');
        expect(spot.garage).toHaveProperty('name');
        expect(spot.garage).toHaveProperty('address');
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/parking?page=1&limit=10')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.spots.length).toBeLessThanOrEqual(10);
    });

    it('should filter spots by status', async () => {
      // Create an occupied spot
      await prisma.spot.create({
        data: {
          garageId,
          name: 'Occupied Spot',
          description: 'Test occupied spot',
          status: 'occupied',
          hourlyRate: 2.0,
          dayRate: 15.0,
          earlyBirdRate: 12.0,
          minimumDuration: 15,
        },
      });

      const response = await request(app)
        .get('/api/parking?status=available')
        .expect(200);

      const spots = response.body.spots;
      spots.forEach((spot: any) => {
        expect(spot.status).toBe('available');
      });
    });

    it('should filter spots by garageId', async () => {
      const response = await request(app)
        .get(`/api/parking?garageId=${garageId}`)
        .expect(200);

      const spots = response.body.spots;
      spots.forEach((spot: any) => {
        expect(spot.garageId).toBe(garageId);
      });
    });

    it('should return empty array when no spots match filters', async () => {
      const response = await request(app)
        .get('/api/parking?status=maintenance')
        .expect(200);

      expect(response.body.spots).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe('GET /api/parking/:id', () => {
    it('should return specific spot by ID', async () => {
      const response = await request(app)
        .get(`/api/parking/${spotId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', spotId);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('garage');
    });

    it('should return 404 for non-existent spot', async () => {
      const response = await request(app)
        .get('/api/parking/non-existent-id')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });
});
