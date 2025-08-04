/**
 * VideoGrid Component
 * Manages the layout and display of participant video streams
 */

import React from 'react';
import { Mic, MicOff, VideoOff, Monitor } from 'lucide-react';
import { Participant } from '../App';

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  currentUser: Participant;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  remoteStreams,
  participants,
  currentUser,
  isVideoEnabled,
  isAudioEnabled
}) => {
  // Filter out current user from participants for remote video display
  const remoteParticipants = participants.filter(p => p.id !== currentUser.id);

  // Calculate grid layout based on participant count
  const getGridLayout = (count: number) => {
    if (count === 0) return 'grid-cols-1';
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 6) return 'grid-cols-3';
    return 'grid-cols-3'; // Max 3 columns for larger groups
  };

  // Video component for individual participants
  const ParticipantVideo: React.FC<{ participant: Participant }> = ({ participant }) => {
    const stream = remoteStreams.get(participant.id);
    
    return (
      <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
        {stream && participant.isVideoEnabled ? (
          <video
            ref={(video) => {
              if (video && stream) {
                video.srcObject = stream;
              }
            }}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mb-3 mx-auto">
                <img 
                  src={participant.avatar} 
                  alt={participant.name}
                  className="w-full h-full rounded-full"
                />
              </div>
              <p className="text-white text-sm font-medium">{participant.name}</p>
            </div>
          </div>
        )}

        {/* Participant name and status */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <div className="bg-black bg-opacity-60 text-white text-sm px-2 py-1 rounded flex items-center space-x-1">
            <span>{participant.name}</span>
            {!participant.isAudioEnabled && <MicOff className="w-3 h-3" />}
            {participant.isScreenSharing && <Monitor className="w-3 h-3" />}
          </div>
        </div>

        {/* Video disabled overlay */}
        {!participant.isVideoEnabled && (
          <div className="absolute top-3 right-3">
            <VideoOff className="w-5 h-5 text-gray-400" />
          </div>
        )}

        {/* Audio muted indicator */}
        {!participant.isAudioEnabled && (
          <div className="absolute top-3 left-3">
            <div className="bg-red-600 p-1 rounded-full">
              <MicOff className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full p-4">
      {remoteParticipants.length === 0 ? (
        // No remote participants - show waiting message
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full rounded-full"
              />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Waiting for others to join...
            </h2>
            <p className="text-gray-400">
              Share the room ID with others to get started
            </p>
          </div>
        </div>
      ) : (
        // Display remote participants in grid
        <div className={`h-full grid ${getGridLayout(remoteParticipants.length)} gap-4 auto-rows-fr`}>
          {remoteParticipants.map((participant) => (
            <ParticipantVideo key={participant.id} participant={participant} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoGrid;