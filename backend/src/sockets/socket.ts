import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

export const initSocket = (server: HttpServer): void => {
  const io = new SocketServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
