import request from 'supertest';
import app from '../src/app';
import { prisma } from './setup';

describe('Booking API', () => {
  let authToken: string;
  let userId: string;
  let spotId: string;
  let garageId: string;

  const testUser = {
    fullName: 'Test User',
    email: 'booking-test@example.com',
    password: 'password123',
    phone: '+77001234567',
  };

  beforeAll(async () => {
    // Clean up existing user if it exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: { id: true },
    });
    
    if (existingUser) {
      await prisma.userProfile.deleteMany({
        where: { userId: existingUser.id },
      });
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });
    }

    // Wait a bit to ensure deletion is complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Create user via signup API to ensure consistency
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        fullName: testUser.fullName,
        email: testUser.email,
        password: testUser.password,
        phone: testUser.phone,
      });

    if (signupResponse.status !== 201) {
      throw new Error(`Signup failed with status ${signupResponse.status}: ${JSON.stringify(signupResponse.body)}`);
    }

    userId = signupResponse.body.user.id;
    authToken = signupResponse.body.token;

    if (!authToken) {
      // If signup didn't return a token, try logging in
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      if (loginResponse.status !== 200) {
        throw new Error(`Login failed after signup: ${JSON.stringify(loginResponse.body)}`);
      }

      authToken = loginResponse.body.token;
    }

    if (!authToken) {
      throw new Error('Failed to obtain auth token');
    }

    // Create a test garage
    const garage = await prisma.garage.create({
      data: {
        name: 'Test Garage',
        address: '123 Test Street',
        city: 'Test City',
        lat: 43.238949,
        lng: 76.889709,
        type: 'outdoor',
        status: 'active',
        totalSpots: 1,
      },
    });
    garageId = garage.id;

    // Create a test parking spot
    const spot = await prisma.spot.create({
      data: {
        id: `spot-test-${Date.now()}`,
        garageId: garage.id,
        name: 'Test Spot 1',
        description: 'Test parking spot',
        status: 'available',
        hourlyRate: 2.0,
        dayRate: 15.0,
        earlyBirdRate: 12.0,
        minimumDuration: 15,
      },
    });
    spotId = spot.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.booking.deleteMany();
    await prisma.spot.deleteMany();
    await prisma.garage.deleteMany();
    
    // Clean up user and profile
    const existingUser = await prisma.user.findUnique({
      where: { email: testUser.email },
      select: { id: true },
    });
    
    if (existingUser) {
      await prisma.userProfile.deleteMany({
        where: { userId: existingUser.id },
      });
    }
    
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  beforeEach(async () => {
    // Clean up any existing bookings first
    await prisma.booking.deleteMany({}).catch(() => {});
    
    // Ensure garage exists - find or create
    let garage = await prisma.garage.findUnique({
      where: { id: garageId },
    });
    
    if (!garage) {
      // Garage was deleted, recreate it
      garage = await prisma.garage.create({
        data: {
          name: 'Test Garage',
          address: '123 Test Street',
          city: 'Test City',
          lat: 43.238949,
          lng: 76.889709,
          type: 'outdoor',
          status: 'active',
          totalSpots: 1,
        },
      });
      garageId = garage.id;
    }

    // Ensure spot exists - find or create
    let spot = await prisma.spot.findUnique({
      where: { id: spotId },
    });
    
    if (!spot) {
      // Spot was deleted, recreate it with the current garage
      const newSpotId = `spot-test-${Date.now()}`;
      spot = await prisma.spot.create({
        data: {
          id: newSpotId,
          garageId: garage.id,
          name: 'Test Spot 1',
          description: 'Test parking spot',
          status: 'available',
          hourlyRate: 2.0,
          dayRate: 15.0,
          earlyBirdRate: 12.0,
          minimumDuration: 15,
        },
      });
      spotId = spot.id;
    } else {
      // Spot exists, just reset its status
      await prisma.spot.update({
        where: { id: spotId },
        data: { status: 'available' },
      });
    }
  });

  describe('POST /api/bookings', () => {
    it('should create a booking for a free spot', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1); // 1 hour from now
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2); // 2 hours later

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('booking');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Booking created successfully');
      
      const booking = response.body.booking;
      expect(booking).toHaveProperty('id');
      expect(booking.spotId).toBe(spotId);
      expect(booking.userId).toBe(userId);
      expect(booking.status).toBe('confirmed');
      expect(booking).toHaveProperty('totalCost');
      expect(booking).toHaveProperty('spot');
      expect(booking.spot.id).toBe(spotId);
    });

    it('should set spot status to reserved after booking', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(201);

      // Verify spot status is now reserved
      const spot = await prisma.spot.findUnique({
        where: { id: spotId },
      });

      expect(spot?.status).toBe('reserved');
    });

    it('should reject booking without authentication', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const response = await request(app)
        .post('/api/bookings')
        .send({
          spotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(401);

      expect(response.body.message).toContain('authorization');
    });

    it('should reject booking with missing spotId', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(400);

      expect(response.body.message).toContain('Spot ID is required');
    });

    it('should reject booking with invalid time range', async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 2);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() - 1); // End before start

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(400);

      expect(response.body.message).toContain('End time must be after start time');
    });

    it('should reject booking with past start time', async () => {
      if (!authToken) {
        throw new Error('Auth token is not set. beforeAll may have failed.');
      }

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - 1); // 1 hour ago
      const endTime = new Date();
      endTime.setHours(endTime.getHours() + 1);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(400);

      expect(response.body.message).toContain('Start time cannot be in the past');
    });

    it('should reject booking for already reserved spot', async () => {
      if (!authToken) {
        throw new Error('Auth token is not set. beforeAll may have failed.');
      }

      // Verify spot exists before testing
      const spotCheck = await prisma.spot.findUnique({
        where: { id: spotId },
      });
      if (!spotCheck) {
        throw new Error(`Spot ${spotId} does not exist. beforeEach may have failed.`);
      }

      // First booking
      const startTime1 = new Date();
      startTime1.setHours(startTime1.getHours() + 1);
      const endTime1 = new Date(startTime1);
      endTime1.setHours(endTime1.getHours() + 2);

      await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime1.toISOString(),
          endTime: endTime1.toISOString(),
        })
        .expect(201);

      // Try to book the same spot again (overlapping time)
      const startTime2 = new Date(startTime1);
      startTime2.setMinutes(startTime2.getMinutes() + 30); // Overlaps with first booking
      const endTime2 = new Date(startTime2);
      endTime2.setHours(endTime2.getHours() + 2);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId,
          startTime: startTime2.toISOString(),
          endTime: endTime2.toISOString(),
        })
        .expect(400);

      expect(response.body.message).toContain('already booked');
    });

    it('should reject booking for non-existent spot', async () => {
      if (!authToken) {
        throw new Error('Auth token is not set. beforeAll may have failed.');
      }

      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const response = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          spotId: 'non-existent-spot-id',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        })
        .expect(400);

      expect(response.body.message).toContain('Spot not found');
    });
  });
});
