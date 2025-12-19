import http from 'http';
import app from './app';
import { initSocket } from './sockets/socket';
import { config } from './config';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Start server
const PORT = config.port;

server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
});

// Handle port already in use error
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`\n❌ ERROR: Port ${PORT} is already in use!\n`);
    console.error('To fix this, run one of these commands:');
    console.error('  Windows:');
    console.error('    netstat -ano | findstr :5000');
    console.error('    taskkill /F /PID <PID>');
    console.error('\n  Or use the helper script:');
    console.error('    npm run free-port\n');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

