/**
 * HomePage Component
 * Landing page with options to create or join meeting rooms
 */

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Users, MessageCircle, Shield, Zap, Globe } from 'lucide-react';
import { AppContext } from '../App';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected } = useContext(AppContext);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');

  // Create new meeting room
  const handleCreateRoom = async () => {
    if (!isConnected) {
      alert('Not connected to server. Please try again.');
      return;
    }

    setIsCreatingRoom(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const { roomId } = await response.json();
      navigate(`/join/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Join existing room
  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) {
      alert('Please enter a room ID');
      return;
    }

    navigate(`/join/${joinRoomId.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ProLiteMeet</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Video
            <span className="text-blue-600 block">Conferencing</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Connect with anyone, anywhere with high-quality video calls, 
            screen sharing, and real-time collaboration. Free and open-source.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleCreateRoom}
              disabled={!isConnected || isCreatingRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold 
                         transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         flex items-center justify-center space-x-2"
            >
              <Video className="w-5 h-5" />
              <span>{isCreatingRoom ? 'Creating Room...' : 'Create New Meeting'}</span>
            </button>

            <div className="flex">
              <input
                type="text"
                placeholder="Enter Room ID"
                value={joinRoomId}
                onChange=(e) => setJoinRoomId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="px-4 py-4 border border-gray-300 rounded-l-xl focus:outline-none 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder-gray-400 min-w-0 flex-1"
              />
              <button
                onClick={handleJoinRoom}
                disabled={!isConnected}
                className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-4 rounded-r-xl font-semibold 
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center"
              >
                Join
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">HD Video & Audio</h3>
              <p className="text-gray-600">
                Crystal-clear video calls with adaptive quality and noise suppression for professional meetings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Participant</h3>
              <p className="text-gray-600">
                Support for multiple participants with intelligent video grid layout and participant management.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <MessageCircle className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-time Chat</h3>
              <p className="text-gray-600">
                Instant messaging with message history and file sharing capabilities during meetings.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600">
                End-to-end encrypted communications with no data stored on servers.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Screen Sharing</h3>
              <p className="text-gray-600">
                Share your screen, specific applications, or browser tabs with all participants.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Cross-Platform</h3>
              <p className="text-gray-600">
                Works on all devices and browsers with responsive design for mobile and desktop.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 mt-16">
        <div className="text-center text-gray-600">
          <p className="mb-2">© 2024 ProLiteMeet. Built with React, WebRTC, and Socket.IO.</p>
          <p className="text-sm">Free and open-source video conferencing solution.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
  )
}