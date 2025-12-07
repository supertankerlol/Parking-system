# Test Database Setup Instructions

## Quick Setup

### Step 1: Add DATABASE_URL_TEST to .env

Add this line to your `.env` file (replace with your actual database credentials):

```env
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/parking_system_test
```

**Note:** Replace `username`, `password`, `localhost`, and `5432` with your actual PostgreSQL credentials. The database name should be `parking_system_test`.

### Step 2: Create the Test Database

Connect to PostgreSQL and create the test database:

```sql
CREATE DATABASE parking_system_test;
```

Or using psql command line:
```bash
psql -U your_username -d postgres -c "CREATE DATABASE parking_system_test;"
```

### Step 3: Run Migrations on Test Database

Run Prisma migrations on the test database:

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL=$env:DATABASE_URL_TEST
npx prisma migrate deploy
```

**Linux/Mac:**
```bash
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
```

Or directly:
```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```
(But you'll need to temporarily set DATABASE_URL to the test database URL)

### Step 4: Run Tests

```bash
npm test
```

## Automated Setup Scripts

### Windows (PowerShell)

Run the PowerShell script:
```powershell
.\scripts\setup-test-db.ps1
```

### Linux/Mac

Make the script executable and run it:
```bash
chmod +x scripts/setup-test-db.sh
./scripts/setup-test-db.sh
```

## Manual Setup

If you prefer to set up manually:

1. **Extract your current DATABASE_URL** from `.env`
   - Format: `postgresql://username:password@host:port/database`

2. **Create DATABASE_URL_TEST** by changing only the database name:
   - From: `postgresql://user:pass@localhost:5432/parking_system`
   - To: `postgresql://user:pass@localhost:5432/parking_system_test`

3. **Add to .env:**
   ```env
   DATABASE_URL_TEST=postgresql://user:pass@localhost:5432/parking_system_test
   ```

4. **Create database:**
   ```sql
   CREATE DATABASE parking_system_test;
   ```

5. **Run migrations:**
   ```bash
   DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
   ```

## Verification

To verify the setup:

1. Check that `.env` contains `DATABASE_URL_TEST`
2. Verify database exists:
   ```sql
   \l
   ```
   (in psql, you should see `parking_system_test`)

3. Run a simple test:
   ```bash
   npm test -- auth.test.ts
   ```

## Troubleshooting

### Database connection errors

- Verify PostgreSQL is running
- Check credentials in `DATABASE_URL_TEST`
- Ensure the test database exists

### Migration errors

- Make sure you're using the correct `DATABASE_URL_TEST`
- Check that the database is empty or can be migrated
- Try: `npx prisma migrate reset` (⚠️ This will delete all data!)

### Test failures

- Ensure migrations ran successfully
- Check that `DATABASE_URL_TEST` is set correctly
- Verify test database is separate from development database
