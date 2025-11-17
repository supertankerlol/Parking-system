// server.js
// Server startup and database connection

const app = require('./app');
const { port, nodeEnv } = require('./config/env');
const { connectDatabase } = require('./config/database');

// Connect to database
connectDatabase();

// Start server
const server = app.listen(port, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('🚀 Parking System Backend Server');
  console.log('═══════════════════════════════════════════════════');
  console.log(`📡 Server running on port: ${port}`);
  console.log(`🌍 Environment: ${nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${port}/health`);
  console.log(`📝 API Base URL: http://localhost:${port}/api`);
  console.log('═══════════════════════════════════════════════════');
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
