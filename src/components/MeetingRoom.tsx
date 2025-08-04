/**
 * MeetingRoom Component
 * Main video conferencing interface with video grid, controls, and chat
 */

import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MessageCircle, 
  Phone, Users, Settings, MoreVertical, Copy, Check 
} from 'lucide-react';
import { AppContext, Participant } from '../App';
import VideoGrid from './VideoGrid';
import ChatPanel from './ChatPanel';
import WebRTCManager from '../utils/WebRTCManager';

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { socket, currentRoom, currentUser, participants, isConnected } = useContext(AppContext);

  // Media states
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [roomIdCopied, setRoomIdCopied] = useState(false);

  // Refs
  const webRTCManagerRef = useRef<WebRTCManager | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Initialize WebRTC and get user media
  useEffect(() => {
    if (!socket || !currentRoom || !currentUser) {
      navigate('/');
      return;
    }

    initializeMedia();
    setupWebRTC();

    return () => {
      cleanup();
    };
  }, [socket, currentRoom, currentUser]);

  // Initialize user media (camera and microphone)
  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log('✅ Local media initialized');
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      alert('Unable to access camera or microphone. Please check permissions.');
    }
  };

  // Setup WebRTC manager
  const setupWebRTC = () => {
    if (!socket || !currentRoom) return;

    webRTCManagerRef.current = new WebRTCManager(socket, currentRoom);
    
    // Handle remote streams
    webRTCManagerRef.current.onRemoteStream = (participantId: string, stream: MediaStream) => {
      console.log('📺 Received remote stream from:', participantId);
      setRemoteStreams(prev => new Map(prev.set(participantId, stream)));
    };

    // Handle participant leaving
    webRTCManagerRef.current.onParticipantLeft = (participantId: string) => {
      console.log('👋 Participant left:', participantId);
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.delete(participantId);
        return newMap;
      });
    };
  };

  // Add local stream to WebRTC connections
  useEffect(() => {
    if (localStream && webRTCManagerRef.current) {
      webRTCManagerRef.current.setLocalStream(localStream);
    }
  }, [localStream]);

  // Handle new participants joining
  useEffect(() => {
    if (webRTCManagerRef.current && participants.length > 0) {
      // Create connections for new participants
      participants.forEach(participant => {
        if (participant.id !== currentUser?.id && !remoteStreams.has(participant.id)) {
          webRTCManagerRef.current?.createConnection(participant.id);
        }
      });
    }
  }, [participants, currentUser, remoteStreams]);

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        
        // Notify other participants
        if (socket && currentRoom) {
          socket.emit('toggle-video', {
            isVideoEnabled: !isVideoEnabled,
            roomId: currentRoom
          });
        }
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        
        // Notify other participants
        if (socket && currentRoom) {
          socket.emit('toggle-audio', {
            isAudioEnabled: !isAudioEnabled,
            roomId: currentRoom
          });
        }
      }
    }
  };

  // Toggle screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            mediaSource: 'screen'
          },
          audio: true
        });

        // Replace video track in all peer connections
        if (webRTCManagerRef.current && localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          webRTCManagerRef.current.replaceVideoTrack(videoTrack);
          
          // Update local video
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }

          // Handle screen share end
          videoTrack.onended = () => {
            stopScreenShare();
          };

          setIsScreenSharing(true);
        }
      } else {
        stopScreenShare();
      }

      // Notify other participants
      if (socket && currentRoom) {
        socket.emit('toggle-screen-share', {
          isScreenSharing: !isScreenSharing,
          roomId: currentRoom
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      alert('Unable to share screen. Please try again.');
    }
  };

  // Stop screen sharing
  const stopScreenShare = async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false // Keep original audio track
      });

      // Replace screen share track with camera track
      if (webRTCManagerRef.current && localStream) {
        const videoTrack = cameraStream.getVideoTracks()[0];
        webRTCManagerRef.current.replaceVideoTrack(videoTrack);
        
        // Update local video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = cameraStream;
        }
      }

      setIsScreenSharing(false);
    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  };

  // Leave meeting
  const leaveMeeting = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    cleanup();
    navigate('/');
  };

  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom);
      setRoomIdCopied(true);
      setTimeout(() => setRoomIdCopied(false), 2000);
    }
  };

  // Cleanup function
  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (webRTCManagerRef.current) {
      webRTCManagerRef.current.cleanup();
    }
  };

  // Don't render if not properly connected to room
  if (!currentRoom || !currentUser) {
    return null;
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <h1 className="text-white font-semibold">ProLiteMeet</h1>
          <div className="flex items-center space-x-2 bg-gray-700 px-3 py-1 rounded-full">
            <span className="text-gray-300 text-sm">Room: {currentRoom}</span>
            <button
              onClick={copyRoomId}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Copy Room ID"
            >
              {roomIdCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Participants count */}
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">{participants.length}</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={participants}
            currentUser={currentUser}
            localVideoRef={localVideoRef}
            isVideoEnabled={isVideoEnabled}
            isAudioEnabled={isAudioEnabled}
          />

          {/* Local video in corner */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {currentUser.name} (You)
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 border-l border-gray-700">
            <ChatPanel onClose={() => setIsChatOpen(false)} />
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-center space-x-4 border-t border-gray-700">
        {/* Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-all ${
            isAudioEnabled 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Video Toggle */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-all ${
            isVideoEnabled 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-all ${
            isScreenSharing 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor className="w-6 h-6" />
        </button>

        {/* Chat Toggle */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-3 rounded-full transition-all ${
            isChatOpen 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          title="Toggle chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>

        {/* Leave Meeting */}
        <button
          onClick={leaveMeeting}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all ml-8"
          title="Leave meeting"
        >
          <Phone className="w-6 h-6 transform rotate-135" />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-20 left-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          Connection lost. Trying to reconnect...
        </div>
      )}
    </div>
  );
};

export default MeetingRoom;