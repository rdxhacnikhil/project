# ProLiteMeet Backend

Backend server for ProLiteMeet video conferencing application built with Node.js, Express, and Socket.IO.

## Features

- **Real-time Communication**: Socket.IO for instant messaging and signaling
- **WebRTC Signaling**: Handles peer-to-peer connection establishment
- **Room Management**: Create and manage video conference rooms
- **Participant Tracking**: Track users joining/leaving rooms
- **Chat System**: Real-time messaging within rooms
- **Media State Management**: Handle audio/video toggle states
- **Screen Sharing Support**: Coordinate screen sharing between participants

## Tech Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **CORS**: Cross-origin resource sharing
- **UUID**: Generate unique identifiers

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Room Management
- **GET** `/api/room/:roomId` - Get room information

## Socket.IO Events

### Client to Server Events

- `join-room` - Join a video conference room
- `send-message` - Send chat message
- `webrtc-offer` - Send WebRTC offer
- `webrtc-answer` - Send WebRTC answer
- `webrtc-ice-candidate` - Send ICE candidate
- `toggle-audio` - Toggle audio mute state
- `toggle-video` - Toggle video on/off state
- `start-screen-share` - Start screen sharing
- `stop-screen-share` - Stop screen sharing
- `leave-room` - Leave the room

### Server to Client Events

- `joined-room` - Confirmation of room join
- `user-joined` - New user joined the room
- `user-left` - User left the room
- `participants-updated` - Updated participant list
- `new-message` - New chat message
- `webrtc-offer` - Received WebRTC offer
- `webrtc-answer` - Received WebRTC answer
- `webrtc-ice-candidate` - Received ICE candidate
- `participant-audio-toggled` - Participant toggled audio
- `participant-video-toggled` - Participant toggled video
- `user-started-screen-share` - User started screen sharing
- `user-stopped-screen-share` - User stopped screen sharing

## Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set the following:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**:
     - `FRONTEND_URL`: Your frontend URL (e.g., `https://your-app.vercel.app`)
     - `NODE_ENV`: `production`

### Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Set the root directory to `backend`
4. Add environment variables:
   - `FRONTEND_URL`: Your frontend URL
   - `NODE_ENV`: `production`

### Deploy to Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
```bash
heroku create your-app-name
```

3. Set environment variables:
```bash
heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app
heroku config:set NODE_ENV=production
```

4. Create a `Procfile` in the backend directory:
```
web: node server.js
```

5. Deploy:
```bash
git subtree push --prefix backend heroku main
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restarts on file changes.

### Testing the Server

1. Start the server
2. Visit `http://localhost:3001/health` to check server status
3. Use a WebSocket client to test Socket.IO connections

## Architecture

The backend follows a modular architecture:

- **server.js**: Main server file with Express and Socket.IO setup
- **Room Management**: In-memory storage for active rooms and participants
- **WebRTC Signaling**: Relay WebRTC offers, answers, and ICE candidates
- **Real-time Chat**: Handle message broadcasting within rooms
- **State Management**: Track participant audio/video states

## Security Considerations

- CORS configured for specific frontend origins
- Input validation for room IDs and user data
- Error handling for malformed requests
- Rate limiting can be added for production use

## Monitoring

The server logs important events:
- User connections/disconnections
- Room creation/deletion
- Message sending
- WebRTC signaling events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details