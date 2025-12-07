# Test Database Setup Guide

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script which will automatically add `DATABASE_URL_TEST` to your `.env` file:

```bash
npm run test:setup-db
```

Then follow the instructions it prints.

### Option 2: Manual Setup

1. **Add to `.env` file:**

   Open your `.env` file and add this line (replace with your actual credentials):

   ```env
   DATABASE_URL_TEST=postgresql://username:password@localhost:5432/parking_system_test
   ```

   **Important:** Replace `username`, `password`, `localhost`, and `5432` with your actual PostgreSQL credentials. The database name should be `parking_system_test`.

2. **Create the test database:**

   Connect to PostgreSQL and run:

   ```sql
   CREATE DATABASE parking_system_test;
   ```

   Or using psql command line:
   ```bash
   psql -U your_username -d postgres -c "CREATE DATABASE parking_system_test;"
   ```

3. **Run migrations on test database:**

   **Important:** Make sure you're in the `backend` directory before running these commands.

   **Windows (PowerShell):**
   ```powershell
   $envContent = Get-Content .env -Raw
   if ($envContent -match "DATABASE_URL_TEST=([^\r\n]+)") {
       $env:DATABASE_URL = $matches[1].Trim()
   }
   npx prisma migrate deploy
   ```
   
   Or as a one-liner:
   ```powershell
   $envContent = Get-Content .env -Raw; if ($envContent -match "DATABASE_URL_TEST=([^\r\n]+)") { $env:DATABASE_URL = $matches[1].Trim() }; npx prisma migrate deploy
   ```

   **Linux/Mac:**
   ```bash
   DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

## Complete Setup Steps

### Step 1: Run Setup Script

```bash
npm run test:setup-db
```

This will:
- Read your existing `DATABASE_URL` from `.env`
- Create `DATABASE_URL_TEST` with the test database name
- Add it to your `.env` file

### Step 2: Create Test Database

You need to create the test database in PostgreSQL. The script will show you the exact command, but here's the general format:

```sql
CREATE DATABASE parking_system_test;
```

Or using psql:
```bash
psql -h localhost -p 5432 -U your_username -d postgres -c "CREATE DATABASE parking_system_test;"
```

### Step 3: Run Migrations

Apply the database schema to the test database:

**Important:** Make sure you're in the `backend` directory before running these commands.

**Windows (PowerShell):**
```powershell
cd backend
$envContent = Get-Content .env -Raw
if ($envContent -match "DATABASE_URL_TEST=([^\r\n]+)") {
    $env:DATABASE_URL = $matches[1].Trim()
}
npx prisma migrate deploy
```

Or as a one-liner:
```powershell
cd backend; $envContent = Get-Content .env -Raw; if ($envContent -match "DATABASE_URL_TEST=([^\r\n]+)") { $env:DATABASE_URL = $matches[1].Trim() }; npx prisma migrate deploy
```

**Linux/Mac:**
```bash
DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate deploy
```

### Step 4: Verify Setup

Run a quick test to verify everything works:

```bash
npm test -- auth.test.ts
```

## Troubleshooting

### "DATABASE_URL is not set" error

Make sure your `.env` file contains `DATABASE_URL` before running the setup script.

### Database connection errors

- Verify PostgreSQL is running
- Check that credentials in `DATABASE_URL_TEST` are correct
- **Fix incorrect credentials**: If you get authentication errors, your `DATABASE_URL_TEST` might have placeholder values. Fix it by running:
  ```powershell
  # Read DATABASE_URL from .env and create correct DATABASE_URL_TEST
  $envContent = Get-Content .env -Raw
  if ($envContent -match "DATABASE_URL=postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
      $username = $matches[1]
      $password = $matches[2]
      $dbHost = $matches[3]
      $port = $matches[4]
      $testDbUrl = "postgresql://${username}:${password}@${dbHost}:${port}/parking_system_test"
      
      # Update DATABASE_URL_TEST in .env
      if ($envContent -match "DATABASE_URL_TEST") {
          $envContent = $envContent -replace "DATABASE_URL_TEST=.*", "DATABASE_URL_TEST=$testDbUrl"
      } else {
          $envContent += "`nDATABASE_URL_TEST=$testDbUrl"
      }
      Set-Content -Path .env -Value $envContent -NoNewline
      Write-Host "Updated DATABASE_URL_TEST with correct credentials" -ForegroundColor Green
  }
  ```
- Ensure the test database exists (run `CREATE DATABASE parking_system_test;`)

### Migration errors

- Make sure `DATABASE_URL_TEST` is set correctly in `.env`
- Verify you're using the correct database URL when running migrations
- **Password with special characters**: If your password contains special characters (like `@`, `:`, `/`, `#`, `%`, etc.), you need to URL-encode them in the connection string. For example:
  - `@` becomes `%40`
  - `:` becomes `%3A`
  - `/` becomes `%2F`
  - `#` becomes `%23`
  - `%` becomes `%25`
  - Space becomes `%20`
- **Verify the connection string**: You can check what Prisma is reading by temporarily adding this to your script:
  ```powershell
  $envContent = Get-Content .env -Raw
  if ($envContent -match "DATABASE_URL_TEST=([^\r\n]+)") {
      $env:DATABASE_URL = $matches[1].Trim()
      Write-Host "Using DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Yellow
  }
  ```
- **Test connection manually**: Try connecting with psql to verify credentials (if psql is in your PATH):
  ```powershell
  # Extract connection details and test
  $envContent = Get-Content .env -Raw
  if ($envContent -match "DATABASE_URL_TEST=postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
      $username = $matches[1]
      $password = $matches[2]
      $dbHost = $matches[3]
      $port = $matches[4]
      $database = $matches[5]
      Write-Host "Testing connection to: $dbHost:$port/$database as $username"
      # Set password environment variable for psql
      $env:PGPASSWORD = $password
      # Try psql connection
      psql -h $dbHost -p $port -U $username -d $database -c "SELECT version();"
  }
  ```
- **Create test database** (if psql is available):
  ```powershell
  $envContent = Get-Content .env -Raw
  if ($envContent -match "DATABASE_URL_TEST=postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
      $username = $matches[1]
      $password = $matches[2]
      $dbHost = $matches[3]
      $port = $matches[4]
      $database = $matches[5]
      Write-Host "Creating database '$database'..." -ForegroundColor Cyan
      $env:PGPASSWORD = $password
      psql -h $dbHost -p $port -U $username -d postgres -c "CREATE DATABASE $database;"
  }
  ```
- **If psql is not in PATH**: You can either:
  - Add PostgreSQL bin directory to your PATH (usually `C:\Program Files\PostgreSQL\<version>\bin`)
  - Use the full path to psql: `& "C:\Program Files\PostgreSQL\<version>\bin\psql.exe" ...`
  - Use a database GUI tool (pgAdmin, DBeaver, etc.) to create the database manually
  - Use Prisma Studio or another database client
- Try resetting: `DATABASE_URL=$DATABASE_URL_TEST npx prisma migrate reset` (⚠️ deletes all data!)

### Test failures

- Ensure migrations ran successfully on the test database
- Check that `DATABASE_URL_TEST` is set in `.env`
- Verify the test database is separate from your development database

## What the Test Database Does

- **Isolation**: Tests run against a separate database, so your development data is safe
- **Clean State**: The test setup automatically cleans the database before and after tests
- **No Side Effects**: Test failures won't affect your development environment

## Important Notes

⚠️ **Never use your production database as the test database!**

The test suite will:
- Delete all data before running tests
- Delete all data after running tests
- Create and destroy test data during test execution

Always use a dedicated test database (`parking_system_test`).
