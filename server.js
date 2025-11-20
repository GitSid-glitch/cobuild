const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(server, {
    path: '/api/socket',
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
      console.log('Message sent:', message.id);
    });

    socket.on('typing', ({ userId, chatId }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', { userId, chatId });
    });

    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User joined chat: ${chatId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Socket.io server running on /api/socket`);
    });
});
