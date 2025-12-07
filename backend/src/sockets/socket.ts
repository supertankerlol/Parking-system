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

export const getIo = (): SocketServer => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return ioInstance;
};

export const emitSpotUpdate = (payload: any): void => {
  const io = getIo();
  io.emit('spot:update', payload);
};
