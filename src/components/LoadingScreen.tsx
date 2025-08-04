/**
 * LoadingScreen Component
 * Displays loading state while connecting to server
 */

import React from 'react';
import { Video, Loader } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center">
            <Video className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900">ProLiteMeet</span>
        </div>

        {/* Loading animation */}
        <div className="mb-6">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        </div>

        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connecting to server...
        </h2>
        <p className="text-gray-600">
          Setting up your meeting experience
        </p>

        {/* Progress indicators */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span>Establishing connection</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Initializing WebRTC</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Ready to join</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;