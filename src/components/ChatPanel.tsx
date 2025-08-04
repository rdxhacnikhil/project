/**
 * ChatPanel Component
 * Real-time chat functionality within the meeting room
 */

import React, { useState, useContext, useRef, useEffect } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { AppContext, ChatMessage } from '../App';

interface ChatPanelProps {
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onClose }) => {
  const { socket, currentRoom, currentUser, messages } = useContext(AppContext);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Send message
  const sendMessage = () => {
    if (!messageText.trim() || !socket || !currentRoom || !currentUser || isSending) {
      return;
    }

    setIsSending(true);

    socket.emit('send-message', {
      message: messageText.trim(),
      roomId: currentRoom,
      userName: currentUser.name,
      userAvatar: currentUser.avatar
    });

    setMessageText('');
    setIsSending(false);
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Message component
  const MessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isOwnMessage = message.senderId === currentUser?.id;

    return (
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-xs ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-2`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
            <img 
              src={message.senderAvatar} 
              alt={message.sender}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Message bubble */}
          <div className={`rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-900'
          }`}>
            {!isOwnMessage && (
              <p className="text-xs text-gray-600 mb-1 font-medium">
                {message.sender}
              </p>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.text}
            </p>
            <p className={`text-xs mt-1 ${
              isOwnMessage ? 'text-blue-200' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Chat</h3>
          <span className="text-sm text-gray-500">({messages.length})</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-400 text-xs">Start a conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={1}
              maxLength={500}
              disabled={isSending}
            />
            <div className="absolute bottom-1 right-1 text-xs text-gray-400">
              {messageText.length}/500
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!messageText.trim() || isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Tips */}
        <p className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;