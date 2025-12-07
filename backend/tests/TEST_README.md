# Testing Guide

This directory contains Jest-based integration tests for the Parking System backend API.

## Test Files

- **auth.test.ts**: Tests for user authentication (signup, login, token validation)
- **booking.test.ts**: Tests for booking creation and management
- **parking.test.ts**: Tests for parking spots listing and retrieval

## Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Test Database**

   You need a separate test database to avoid affecting your development database. Set up one of the following:

   ### Option 1: Separate PostgreSQL Database (Recommended)

   Create a test database in PostgreSQL:
   ```sql
   CREATE DATABASE parking_system_test;
   ```

   Then set the `DATABASE_URL_TEST` environment variable in your `.env` file:
   ```env
   DATABASE_URL_TEST=postgresql://username:password@localhost:5432/parking_system_test
   ```

   ### Option 2: Use In-Memory Database (Alternative)

   For faster tests, you can use SQLite in-memory database:
   ```env
   DATABASE_URL_TEST=file:./test.db
   ```

   Note: If `DATABASE_URL_TEST` is not set, tests will use `DATABASE_URL` as fallback.

3. **Environment Variables**

   Ensure your `.env` file has the following variables:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/parking_system
   DATABASE_URL_TEST=postgresql://username:password@localhost:5432/parking_system_test
   JWT_SECRET=your-jwt-secret-key
   CV_SECRET=your-cv-secret-key
   ```

4. **Run Database Migrations**

   Before running tests, ensure your test database schema is up to date:
   ```bash
   # Set DATABASE_URL to test database temporarily
   export DATABASE_URL=$DATABASE_URL_TEST
   npm run prisma:migrate
   ```

   Or manually:
   ```bash
   npx prisma migrate deploy --schema=./prisma/schema.prisma
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test auth.test.ts
npm test booking.test.ts
npm test parking.test.ts
```

## Test Structure

### Auth Tests (`auth.test.ts`)

Tests the complete authentication flow:
- ✅ User signup with valid data
- ✅ Signup validation (duplicate email, missing fields)
- ✅ User login with valid credentials
- ✅ Login validation (invalid credentials, missing fields)
- ✅ Token validation via `/api/users/me` endpoint
- ✅ Full flow: signup → login → token validation

### Booking Tests (`booking.test.ts`)

Tests booking creation:
- ✅ Create booking for available spot
- ✅ Verify spot status changes to 'reserved' after booking
- ✅ Authentication required
- ✅ Validation (missing fields, invalid time ranges, past dates)
- ✅ Reject booking for already reserved spots
- ✅ Reject booking for non-existent spots

### Parking Tests (`parking.test.ts`)

Tests parking spots listing:
- ✅ List all parking spots
- ✅ Verify seeded spot data (G1-B1-A01) is returned
- ✅ Include garage information with spots
- ✅ Pagination support
- ✅ Filter by status
- ✅ Filter by garageId
- ✅ Get specific spot by ID

## Test Database Setup

The test setup file (`tests/setup.ts`) automatically:
- Connects to the test database
- Cleans all data before running tests (in `beforeAll`)
- Cleans all data after running tests (in `afterAll`)

**⚠️ Warning**: The test suite will DELETE ALL DATA in the test database. Never use your production database as the test database!

## Troubleshooting

### Tests Fail with Database Connection Error

1. Verify `DATABASE_URL_TEST` is set correctly
2. Ensure the test database exists
3. Check database credentials and permissions
4. Verify Prisma migrations are applied to test database

### Tests Fail with "Table does not exist"

Run migrations on the test database:
```bash
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
```

### Tests Timeout

Increase timeout in `jest.config.js`:
```javascript
testTimeout: 60000, // 60 seconds
```

### Port Already in Use

If you get port conflicts, ensure no other instance of the app is running on the test port.

## Continuous Integration

For CI/CD pipelines, ensure:
1. Test database is set up in CI environment
2. `DATABASE_URL_TEST` environment variable is configured
3. Database migrations run before tests
4. Tests run in isolated environment

Example CI configuration:
```yaml
# Example GitHub Actions
- name: Setup test database
  run: |
    createdb parking_system_test
    DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy

- name: Run tests
  env:
    DATABASE_URL_TEST: ${{ secrets.DATABASE_URL_TEST }}
    JWT_SECRET: test-secret
    CV_SECRET: test-cv-secret
  run: npm test
```

## Best Practices

1. **Always use a separate test database** - Never test against production or development databases
2. **Keep tests isolated** - Each test should be independent and not rely on other tests
3. **Clean up after tests** - The setup file handles this, but be mindful of any additional cleanup needed
4. **Use descriptive test names** - Make it clear what each test is validating
5. **Test both success and failure cases** - Verify error handling works correctly

## Notes

- Tests use `supertest` for HTTP assertions
- Tests use the actual Express app instance
- Database operations use Prisma Client
- All tests run against a real database (not mocked)
- Test data is automatically cleaned before and after test runs
