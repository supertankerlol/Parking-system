import '../src/types'; // Import type definitions
import { PrismaClient } from '@prisma/client';

// DATABASE_URL should already be set by setup.env.ts
const testDatabaseUrl = process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error('DATABASE_URL must be set for tests (should be set by setup.env.ts)');
}

// Create a separate Prisma client for tests
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDatabaseUrl,
    },
  },
});

// Global setup: run before all tests
beforeAll(async () => {
  // Ensure database connection
  await prisma.$connect();
  
  // Clean database before running tests
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.parkingHistory.deleteMany();
  await prisma.cVEvent.deleteMany();
  await prisma.adminAudit.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
});

// Global teardown: run after all tests
afterAll(async () => {
  // Clean up after all tests
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.parkingHistory.deleteMany();
  await prisma.cVEvent.deleteMany();
  await prisma.adminAudit.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.floor.deleteMany();
  await prisma.garage.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.user.deleteMany();
  
  // Disconnect Prisma
  await prisma.$disconnect();
});

// Export prisma instance for use in tests
export { prisma };
