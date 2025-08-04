/**
 * JoinRoom Component
 * Interface for entering user details before joining a meeting room
 */

import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, User, ArrowLeft, AlertCircle, Loader } from 'lucide-react';
import { AppContext } from '../App';

const JoinRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useContext(AppContext);

  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  // Avatar options using DiceBear API
  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user3&backgroundColor=d1d4f9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user4&backgroundColor=fde2e4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user5&backgroundColor=fad2cf',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user6&backgroundColor=e2ece9'
  ];

  // Check if room exists when component mounts
  useEffect(() => {
    if (roomId) {
      checkRoomExists(roomId);
    }
  }, [roomId]);

  // Check room existence
  const checkRoomExists = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/room/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setRoomExists(true);
        setParticipantCount(data.participantCount);
      } else {
        setRoomExists(false);
      }
    } catch (error) {
      console.error('Error checking room:', error);
      setRoomExists(false);
    }
  };

  // Handle joining the room
  const handleJoinRoom = () => {
    if (!userName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!roomId) {
      alert('Invalid room ID');
      return;
    }

    if (!socket || !isConnected) {
      alert('Not connected to server. Please try again.');
      return;
    }

    setIsJoining(true);

    // Join the room via socket
    socket.emit('join-room', {
      roomId,
      userName: userName.trim(),
      userAvatar: avatarOptions[selectedAvatar]
    });

    // Listen for successful room join
    socket.once('joined-room', () => {
      navigate(`/room/${roomId}`);
    });

    // Handle join errors
    setTimeout(() => {
      setIsJoining(false);
    }, 5000);
  };

  // Handle back to home
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ProLiteMeet</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Room Status */}
          {roomExists === null ? (
            <div className="flex items-center justify-center py-4 mb-6">
              <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600">Checking room...</span>
            </div>
          ) : roomExists ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <Video className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Room Found</p>
                  <p className="text-green-600 text-sm">
                    Room ID: {roomId} • {participantCount} participant{participantCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-red-800 font-medium">Room Not Found</p>
                  <p className="text-red-600 text-sm">The room ID "{roomId}" doesn't exist or has ended.</p>
                </div>
              </div>
            </div>
          )}

          {roomExists && (
            <>
              {/* User Name Input */}
              <div className="mb-6">
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none 
                               focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               placeholder-gray-400 transition-all"
                    maxLength={50}
                  />
                </div>
              </div>

              {/* Avatar Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Your Avatar
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {avatarOptions.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAvatar(index)}
                      className={`w-16 h-16 rounded-full border-2 transition-all transform hover:scale-105
                                  ${selectedAvatar === index 
                                    ? 'border-blue-500 ring-2 ring-blue-200' 
                                    : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img 
                        src={avatar} 
                        alt={`Avatar ${index + 1}`}
                        className="w-full h-full rounded-full"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={handleJoinRoom}
                disabled={!userName.trim() || !isConnected || isJoining}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold
                           transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                           flex items-center justify-center space-x-2"
              >
                {isJoining ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Joining Room...</span>
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    <span>Join Meeting</span>
                  </>
                )}
              </button>

              {/* Connection Status */}
              {!isConnected && (
                <div className="mt-4 text-center">
                  <span className="text-sm text-red-600">
                    Not connected to server. Please check your internet connection.
                  </span>
                </div>
              )}
            </>
          )}

          {!roomExists && roomExists !== null && (
            <button
              onClick={handleBack}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold
                         transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Make sure your camera and microphone are working</p>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;