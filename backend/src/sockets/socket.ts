import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

let ioInstance: SocketServer | null = null;

export const initSocket = (server: HttpServer): SocketServer => {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

export const getIo = (): SocketServer | null => {
  return ioInstance;
};

export const emitSpotUpdate = (payload: any): void => {
  const io = getIo();
  // Gracefully skip emission if Socket.IO is not initialized (e.g., in tests)
  if (io) {
    io.emit('spot:update', payload);
  }
};

export const emitBookingUpdate = (payload: any): void => {
  const io = getIo();
  if (io) {
    io.emit('booking:update', payload);
  }
};
