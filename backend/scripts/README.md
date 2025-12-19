# Backend Scripts

## Port Management

### Free Port 5000

If you encounter the error `EADDRINUSE: address already in use :::5000`, you can free the port using one of these methods:

#### Option 1: Using npm script (Recommended)
```bash
npm run free-port
```

#### Option 2: Using PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File scripts/free-port.ps1
```

#### Option 3: Using Batch file
```cmd
scripts\free-port.bat
```

#### Option 4: Using Node.js script
```bash
node scripts/free-port.js
```

#### Option 5: Manual (Windows)
```cmd
# Find the process
netstat -ano | findstr :5000

# Kill the process (replace <PID> with the actual process ID)
taskkill /F /PID <PID>
```

### Start Server with Auto Port Cleanup

To automatically free the port before starting the dev server:
```bash
npm run dev:clean
```

This will:
1. Free port 5000 if it's in use
2. Start the development server

## Other Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database

