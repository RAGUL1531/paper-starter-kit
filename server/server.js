import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Configure CORS - allow all origins for network access
app.use(cors({
  origin: '*',
  credentials: false
}));

// Socket.io setup with CORS - allow all origins for network access
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store active users and their socket IDs
const activeUsers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins with their info
  socket.on('user:join', (userData) => {
    activeUsers.set(socket.id, {
      ...userData,
      socketId: socket.id,
      online: true
    });
    
    // Broadcast to all users that someone joined
    io.emit('users:update', Array.from(activeUsers.values()));
    console.log('User joined:', userData.name);
  });

  // Handle chat messages
  socket.on('chat:message', (messageData) => {
    const sender = activeUsers.get(socket.id);
    const message = {
      ...messageData,
      sender: sender,
      timestamp: new Date().toISOString(),
      id: `${socket.id}-${Date.now()}`
    };

    // If it's a direct message
    if (messageData.recipientId) {
      socket.to(messageData.recipientId).emit('chat:message', message);
      socket.emit('chat:message', message); // Send back to sender for confirmation
    } else {
      // Broadcast to all
      io.emit('chat:message', message);
    }
  });

  // Typing indicator
  socket.on('chat:typing', (data) => {
    const sender = activeUsers.get(socket.id);
    if (data.recipientId) {
      socket.to(data.recipientId).emit('chat:typing', {
        userId: socket.id,
        userName: sender?.name,
        isTyping: data.isTyping
      });
    } else {
      socket.broadcast.emit('chat:typing', {
        userId: socket.id,
        userName: sender?.name,
        isTyping: data.isTyping
      });
    }
  });

  // ============ VIDEO CALL SIGNALING ============
  
  // Initiate call
  socket.on('call:initiate', (data) => {
    const caller = activeUsers.get(socket.id);
    socket.to(data.recipientId).emit('call:incoming', {
      callerId: socket.id,
      callerName: caller?.name,
      callerAvatar: caller?.avatar,
      callType: data.callType // 'video' or 'audio'
    });
  });

  // Accept call
  socket.on('call:accept', (data) => {
    socket.to(data.callerId).emit('call:accepted', {
      recipientId: socket.id
    });
  });

  // Reject call
  socket.on('call:reject', (data) => {
    socket.to(data.callerId).emit('call:rejected', {
      recipientId: socket.id
    });
  });

  // End call
  socket.on('call:end', (data) => {
    if (data.recipientId) {
      socket.to(data.recipientId).emit('call:ended', {
        userId: socket.id
      });
    }
  });

  // WebRTC signaling - offer
  socket.on('webrtc:offer', (data) => {
    socket.to(data.recipientId).emit('webrtc:offer', {
      offer: data.offer,
      senderId: socket.id
    });
  });

  // WebRTC signaling - answer
  socket.on('webrtc:answer', (data) => {
    socket.to(data.recipientId).emit('webrtc:answer', {
      answer: data.answer,
      senderId: socket.id
    });
  });

  // WebRTC signaling - ICE candidate
  socket.on('webrtc:ice-candidate', (data) => {
    socket.to(data.recipientId).emit('webrtc:ice-candidate', {
      candidate: data.candidate,
      senderId: socket.id
    });
  });

  // Toggle video/audio
  socket.on('call:toggle-video', (data) => {
    socket.to(data.recipientId).emit('call:peer-video-toggle', {
      userId: socket.id,
      enabled: data.enabled
    });
  });

  socket.on('call:toggle-audio', (data) => {
    socket.to(data.recipientId).emit('call:peer-audio-toggle', {
      userId: socket.id,
      enabled: data.enabled
    });
  });

  // Screen sharing
  socket.on('screen:share-start', (data) => {
    socket.to(data.recipientId).emit('screen:share-started', {
      userId: socket.id
    });
  });

  socket.on('screen:share-stop', (data) => {
    socket.to(data.recipientId).emit('screen:share-stopped', {
      userId: socket.id
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    activeUsers.delete(socket.id);
    
    // Notify all users
    io.emit('users:update', Array.from(activeUsers.values()));
    
    // Notify if user was in a call
    io.emit('user:disconnected', {
      userId: socket.id,
      userName: user?.name
    });
    
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Socket.io ready for connections on all network interfaces`);
});
