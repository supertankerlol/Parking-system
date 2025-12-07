import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Use test database URL if available, otherwise use regular DATABASE_URL
const testDatabaseUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!testDatabaseUrl) {
  throw new Error('DATABASE_URL_TEST or DATABASE_URL must be set for tests');
}

// Override DATABASE_URL for tests to use test database
// This must happen before any modules are imported that use Prisma
process.env.DATABASE_URL = testDatabaseUrl;

// Clear any existing global Prisma instance to ensure it uses the test database
// This is important because prisma.client.ts uses a global singleton pattern
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};
if (globalForPrisma.prisma) {
  // Disconnect existing instance if it exists
  if (globalForPrisma.prisma.$disconnect) {
    globalForPrisma.prisma.$disconnect().catch(() => {
      // Ignore disconnect errors
    });
  }
  globalForPrisma.prisma = undefined;
}
