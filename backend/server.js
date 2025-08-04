const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Store active rooms and participants
const rooms = new Map();
const participants = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    activeRooms: rooms.size,
    totalParticipants: participants.size
  });
});

// Get room info endpoint
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({
    roomId,
    participantCount: room.participants.length,
    createdAt: room.createdAt
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Handle joining a room
  socket.on('join-room', ({ roomId, userName }) => {
    try {
      console.log(`User ${userName} (${socket.id}) joining room: ${roomId}`);
      
      // Create room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          participants: [],
          messages: [],
          createdAt: new Date().toISOString()
        });
        console.log(`Created new room: ${roomId}`);
      }
      
      const room = rooms.get(roomId);
      
      // Add participant to room
      const participant = {
        id: socket.id,
        userName,
        joinedAt: new Date().toISOString(),
        isAudioMuted: false,
        isVideoOff: false
      };
      
      room.participants.push(participant);
      participants.set(socket.id, { roomId, userName });
      
      // Join socket room
      socket.join(roomId);
      
      // Notify user they've joined successfully
      socket.emit('joined-room', {
        roomId,
        participantId: socket.id,
        participants: room.participants,
        messages: room.messages
      });
      
      // Notify other participants about new user
      socket.to(roomId).emit('user-joined', {
        participantId: socket.id,
        userName,
        participant
      });
      
      // Send updated participant list to all users in room
      io.to(roomId).emit('participants-updated', room.participants);
      
      console.log(`Room ${roomId} now has ${room.participants.length} participants`);
      
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });
  
  // Handle WebRTC signaling
  socket.on('webrtc-offer', ({ targetId, offer }) => {
    console.log(`WebRTC offer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('webrtc-offer', {
      senderId: socket.id,
      offer
    });
  });
  
  socket.on('webrtc-answer', ({ targetId, answer }) => {
    console.log(`WebRTC answer from ${socket.id} to ${targetId}`);
    socket.to(targetId).emit('webrtc-answer', {
      senderId: socket.id,
      answer
    });
  });
  
  socket.on('webrtc-ice-candidate', ({ targetId, candidate }) => {
    socket.to(targetId).emit('webrtc-ice-candidate', {
      senderId: socket.id,
      candidate
    });
  });
  
  // Handle chat messages
  socket.on('send-message', ({ roomId, message, userName }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      const chatMessage = {
        id: uuidv4(),
        senderId: socket.id,
        userName,
        message,
        timestamp: new Date().toISOString()
      };
      
      room.messages.push(chatMessage);
      
      // Broadcast message to all participants in room
      io.to(roomId).emit('new-message', chatMessage);
      
      console.log(`Message in room ${roomId} from ${userName}: ${message}`);
      
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  // Handle media state changes
  socket.on('toggle-audio', ({ roomId, isAudioMuted }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        participant.isAudioMuted = isAudioMuted;
        socket.to(roomId).emit('participant-audio-toggled', {
          participantId: socket.id,
          isAudioMuted
        });
      }
    }
  });
  
  socket.on('toggle-video', ({ roomId, isVideoOff }) => {
    const room = rooms.get(roomId);
    if (room) {
      const participant = room.participants.find(p => p.id === socket.id);
      if (participant) {
        participant.isVideoOff = isVideoOff;
        socket.to(roomId).emit('participant-video-toggled', {
          participantId: socket.id,
          isVideoOff
        });
      }
    }
  });
  
  // Handle screen sharing
  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-started-screen-share', {
      participantId: socket.id
    });
  });
  
  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-screen-share', {
      participantId: socket.id
    });
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    const participantInfo = participants.get(socket.id);
    if (participantInfo) {
      const { roomId, userName } = participantInfo;
      const room = rooms.get(roomId);
      
      if (room) {
        // Remove participant from room
        room.participants = room.participants.filter(p => p.id !== socket.id);
        
        // Notify other participants
        socket.to(roomId).emit('user-left', {
          participantId: socket.id,
          userName
        });
        
        // Send updated participant list
        io.to(roomId).emit('participants-updated', room.participants);
        
        // Clean up empty rooms
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          console.log(`Deleted empty room: ${roomId}`);
        } else {
          console.log(`Room ${roomId} now has ${room.participants.length} participants`);
        }
      }
      
      participants.delete(socket.id);
    }
  });
  
  // Handle explicit leave room
  socket.on('leave-room', ({ roomId }) => {
    const participantInfo = participants.get(socket.id);
    if (participantInfo && participantInfo.roomId === roomId) {
      socket.leave(roomId);
      socket.emit('left-room', { roomId });
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 ProLiteMeet Backend Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready for connections`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
});

module.exports = { app, server, io };