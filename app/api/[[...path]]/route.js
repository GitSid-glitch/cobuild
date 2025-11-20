import { NextResponse } from 'next/server';
import { Server } from 'socket.io';

// Socket.io server instance
let io;

export async function GET(request) {
  return NextResponse.json({ message: 'CoBuild API is running' });
}

export async function POST(request) {
  const pathname = new URL(request.url).pathname;
  
  // Socket.io upgrade handling
  if (pathname.includes('/api/socket')) {
    if (!io) {
      const httpServer = request.socket.server;
      io = new Server(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });

      io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('user_online', (userId) => {
          socket.userId = userId;
          socket.join(`user_${userId}`);
          console.log(`User ${userId} is online`);
        });

        socket.on('send_message', (message) => {
          // Broadcast message to receiver
          io.to(`user_${message.receiver_id}`).emit('new_message', message);
        });

        socket.on('typing', ({ userId, chatId }) => {
          socket.to(`chat_${chatId}`).emit('user_typing', { userId, chatId });
        });

        socket.on('join_chat', (chatId) => {
          socket.join(`chat_${chatId}`);
        });

        socket.on('disconnect', () => {
          console.log('User disconnected:', socket.id);
        });
      });
    }
    return new NextResponse('Socket initialized', { status: 200 });
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
