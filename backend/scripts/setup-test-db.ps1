# PowerShell script to set up test database
# Run this script to create the test database and run migrations

Write-Host "Setting up test database..." -ForegroundColor Cyan

# Read DATABASE_URL from .env file
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: .env file not found" -ForegroundColor Red
    Write-Host "Please create a .env file with DATABASE_URL first" -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envFile -Raw
if ($envContent -notmatch "DATABASE_URL=(.+)") {
    Write-Host "ERROR: DATABASE_URL is not set in your .env file" -ForegroundColor Red
    Write-Host "Please add DATABASE_URL to your .env file first" -ForegroundColor Yellow
    exit 1
}

# Extract connection details from DATABASE_URL
# Format: postgresql://username:password@host:port/database
$dbUrl = ($envContent | Select-String -Pattern "DATABASE_URL=([^\r\n]+)" | ForEach-Object { $_.Matches.Groups[1].Value })
if ($dbUrl -match "postgresql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)") {
    $username = $matches[1]
    $password = $matches[2]
    $dbHost = $matches[3]
    $port = $matches[4]
    $database = $matches[5]
    
    Write-Host "Detected database connection:" -ForegroundColor Green
    Write-Host "  Host: $dbHost" -ForegroundColor Gray
    Write-Host "  Port: $port" -ForegroundColor Gray
    Write-Host "  Username: $username" -ForegroundColor Gray
    Write-Host "  Database: $database" -ForegroundColor Gray
    
    # Create test database URL
    $testDbUrl = "postgresql://${username}:${password}@${dbHost}:${port}/parking_system_test"
    
    Write-Host "`nTest database URL will be:" -ForegroundColor Green
    Write-Host "  $testDbUrl" -ForegroundColor Gray
    
    # Check if DATABASE_URL_TEST already exists in .env
    if ($envContent -match "DATABASE_URL_TEST") {
            Write-Host "`nDATABASE_URL_TEST already exists in .env file" -ForegroundColor Yellow
            Write-Host "Updating it..." -ForegroundColor Yellow
            $envContent = $envContent -replace "DATABASE_URL_TEST=.*", "DATABASE_URL_TEST=$testDbUrl"
            Set-Content -Path $envFile -Value $envContent -NoNewline
        } else {
            Write-Host "`nAdding DATABASE_URL_TEST to .env file..." -ForegroundColor Green
            Add-Content -Path $envFile -Value "`nDATABASE_URL_TEST=$testDbUrl"
        }
    } else {
        Write-Host "`nCreating .env file with DATABASE_URL_TEST..." -ForegroundColor Green
        Set-Content -Path $envFile -Value "DATABASE_URL_TEST=$testDbUrl"
    }
    
    Write-Host "`nDATABASE_URL_TEST has been added to .env file" -ForegroundColor Green
    
    # Create test database using psql
    Write-Host "`nCreating test database..." -ForegroundColor Cyan
    Write-Host "You may need to run this SQL command manually:" -ForegroundColor Yellow
    Write-Host "  CREATE DATABASE parking_system_test;" -ForegroundColor White
    
    $createDbCommand = "psql -h $dbHost -p $port -U $username -d postgres -c `"CREATE DATABASE parking_system_test;`""
    Write-Host "`nOr run this command:" -ForegroundColor Yellow
    Write-Host "  $createDbCommand" -ForegroundColor White
    
    # Ask user if they want to run migrations
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Create the database (run the SQL command above)" -ForegroundColor White
    Write-Host "2. Run migrations:" -ForegroundColor White
    Write-Host "   `$envContent = Get-Content .env -Raw" -ForegroundColor Gray
    Write-Host "   if (`$envContent -match `"DATABASE_URL_TEST=([^\r\n]+)`") { `$env:DATABASE_URL = `$matches[1].Trim() }" -ForegroundColor Gray
    Write-Host "   npx prisma migrate deploy" -ForegroundColor Gray
    Write-Host "   " -ForegroundColor Gray
    Write-Host "   Or as a one-liner:" -ForegroundColor Gray
    Write-Host "   `$envContent = Get-Content .env -Raw; if (`$envContent -match `"DATABASE_URL_TEST=([^\r\n]+)`") { `$env:DATABASE_URL = `$matches[1].Trim() }; npx prisma migrate deploy" -ForegroundColor Gray
    Write-Host "3. Run tests: npm test" -ForegroundColor White
    
} else {
    Write-Host "ERROR: Could not parse DATABASE_URL format" -ForegroundColor Red
    Write-Host "Expected format: postgresql://username:password@host:port/database" -ForegroundColor Yellow
    exit 1
}
