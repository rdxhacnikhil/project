# ProLiteMeet - Professional Video Conferencing App

A modern, feature-rich video conferencing application built with React.js, WebRTC, and Socket.IO. ProLiteMeet provides high-quality video calls, real-time chat, screen sharing, and professional meeting controls - all using free and open-source technologies.

## 🚀 Features

### Core Video Conferencing
- **HD Video & Audio**: Crystal-clear video calls with adaptive quality
- **Multi-Participant Support**: Connect with multiple users simultaneously
- **WebRTC Technology**: Direct peer-to-peer connections for optimal performance
- **Intelligent Video Grid**: Dynamic layout that adapts to participant count

### Meeting Controls
- **Mute/Unmute Audio**: Toggle microphone with clear visual indicators
- **Video On/Off**: Turn camera on/off with privacy controls
- **Screen Sharing**: Share entire screen, application windows, or browser tabs
- **Leave Meeting**: Clean disconnection with proper cleanup

### Real-time Communication
- **Live Chat**: Instant messaging with message history
- **Participant Management**: See who's in the meeting and their status
- **Connection Status**: Real-time connection monitoring
- **Room Management**: Create and join rooms with unique IDs

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Professional UI**: Clean, modern interface inspired by industry leaders
- **Avatar System**: Personalized avatars for participants
- **Loading States**: Smooth transitions and feedback

## 🛠 Tech Stack

### Frontend
- **React.js 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional communication
- **UUID** - Unique identifier generation
- **CORS** - Cross-origin resource sharing

### WebRTC & Communication
- **WebRTC API** - Peer-to-peer video/audio streaming
- **Socket.IO Client** - Real-time signaling
- **MediaStream API** - Camera and microphone access
- **Screen Capture API** - Screen sharing functionality

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with WebRTC support
- Camera and microphone (for video calls)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prolitemeet
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ..
   npm install
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

5. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on `http://localhost:3001`

6. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   - Install Vercel CLI: `npm i -g vercel`
   - Login: `vercel login`
   - Deploy: `vercel --prod`
   - Set environment variable: `VITE_BACKEND_URL=https://your-backend-url`

### Backend Deployment (Render)

1. **Create account on Render.com**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configuration**:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
   - Environment: `NODE_ENV=production`

### Backend Deployment (Railway)

1. **Create account on Railway.app**
2. **Create new project from GitHub**
3. **Set root directory**: `/backend`
4. **Environment**: `NODE_ENV=production`

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
VITE_BACKEND_URL=http://localhost:3001
```

**Backend**
```env
PORT=3001
NODE_ENV=development
```

### WebRTC Configuration

The app uses Google's STUN servers for NAT traversal:
- `stun:stun.l.google.com:19302`
- Additional STUN servers for redundancy

For production with users behind restrictive firewalls, consider adding TURN servers.

## 📱 Usage

### Creating a Meeting
1. Visit the homepage
2. Click "Create New Meeting"
3. Enter your name and select avatar
4. Share the room ID with participants

### Joining a Meeting
1. Enter room ID on homepage, or
2. Use direct link: `/join/ROOM-ID`
3. Enter your name and select avatar
4. Click "Join Meeting"

### During Meeting
- **Audio**: Click microphone icon to mute/unmute
- **Video**: Click camera icon to turn video on/off
- **Screen Share**: Click monitor icon to share screen
- **Chat**: Click message icon to open/close chat
- **Leave**: Click phone icon to leave meeting

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── HomePage.tsx     # Landing page
│   ├── JoinRoom.tsx     # Pre-meeting setup
│   ├── MeetingRoom.tsx  # Main meeting interface
│   ├── VideoGrid.tsx    # Video layout management
│   ├── ChatPanel.tsx    # Real-time chat
│   └── LoadingScreen.tsx # Loading states
├── utils/
│   └── WebRTCManager.ts # WebRTC connection management
└── App.tsx             # Main app with routing
```

### Backend Structure
```
backend/
├── server.js           # Express server and Socket.IO setup
├── package.json        # Dependencies and scripts
└── README.md          # Backend documentation
```

### Data Flow
1. **Room Creation**: Frontend → Backend API → Database
2. **Signaling**: Frontend ↔ Backend (Socket.IO) ↔ Frontend
3. **Media**: Frontend ↔ WebRTC (P2P) ↔ Frontend
4. **Chat**: Frontend → Backend (Socket.IO) → All Participants

## 🔒 Security Features

- **Room-based Access**: Participants need room ID to join
- **Automatic Cleanup**: Empty rooms are deleted automatically
- **Input Validation**: All user inputs are validated and sanitized
- **CORS Protection**: Configured for secure cross-origin requests
- **P2P Encryption**: WebRTC provides built-in encryption

## 🚨 Troubleshooting

### Common Issues

**Camera/Microphone Not Working**
- Check browser permissions
- Ensure HTTPS in production (required for getUserMedia)
- Try different browser

**Connection Issues**
- Check firewall settings
- Verify backend server is running
- Check network connectivity
- Try different STUN/TURN servers

**Audio/Video Quality**
- Check internet connection speed
- Close other bandwidth-intensive applications
- Try turning off video if audio is priority

**Screen Sharing Not Working**
- Ensure modern browser (Chrome 72+, Firefox 66+)
- Check browser permissions
- Try refreshing the page

### Browser Support
- Chrome 60+
- Firefox 60+
- Safari 11+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **WebRTC Community** for excellent documentation and examples
- **Socket.IO Team** for real-time communication tools
- **React Team** for the amazing UI library
- **Tailwind CSS** for beautiful, utility-first styling
- **Vercel & Render** for excellent deployment platforms

## 📞 Support

For support, please:
1. Check the troubleshooting section
2. Create an issue on GitHub
3. Check existing issues and discussions

---

**ProLiteMeet** - Professional video conferencing made simple, secure, and free.