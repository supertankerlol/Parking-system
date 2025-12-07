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
  console.log(`Server is running on port ${PORT}`);
});
