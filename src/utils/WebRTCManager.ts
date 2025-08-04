/**
 * WebRTCManager Class
 * Handles WebRTC peer-to-peer connections, signaling, and media streaming
 */

import { Socket } from 'socket.io-client';

export default class WebRTCManager {
  private socket: Socket;
  private roomId: string;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private configuration: RTCConfiguration;

  // Callbacks
  public onRemoteStream: ((participantId: string, stream: MediaStream) => void) | null = null;
  public onParticipantLeft: ((participantId: string) => void) | null = null;

  constructor(socket: Socket, roomId: string) {
    this.socket = socket;
    this.roomId = roomId;
    
    // STUN servers configuration for NAT traversal
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    this.setupSocketListeners();
  }

  /**
   * Set up Socket.IO event listeners for WebRTC signaling
   */
  private setupSocketListeners() {
    // Handle WebRTC offer
    this.socket.on('webrtc-offer', async ({ offer, senderSocketId }) => {
      console.log('📨 Received WebRTC offer from:', senderSocketId);
      await this.handleOffer(offer, senderSocketId);
    });

    // Handle WebRTC answer
    this.socket.on('webrtc-answer', async ({ answer, senderSocketId }) => {
      console.log('📨 Received WebRTC answer from:', senderSocketId);
      await this.handleAnswer(answer, senderSocketId);
    });

    // Handle ICE candidate
    this.socket.on('webrtc-ice-candidate', async ({ candidate, senderSocketId }) => {
      console.log('🧊 Received ICE candidate from:', senderSocketId);
      await this.handleIceCandidate(candidate, senderSocketId);
    });

    // Handle user joining (initiate connection)
    this.socket.on('user-joined', (participant) => {
      console.log('👤 User joined, creating connection:', participant.id);
      this.createConnection(participant.id);
    });

    // Handle user leaving
    this.socket.on('user-left', ({ participantId }) => {
      console.log('👋 User left, cleaning up connection:', participantId);
      this.closeConnection(participantId);
      this.onParticipantLeft?.(participantId);
    });
  }

  /**
   * Set local media stream
   */
  setLocalStream(stream: MediaStream) {
    this.localStream = stream;
    console.log('🎥 Local stream set');

    // Add stream to existing connections
    this.peerConnections.forEach((connection, participantId) => {
      this.addStreamToConnection(connection, stream);
    });
  }

  /**
   * Create peer connection for a participant
   */
  async createConnection(participantId: string) {
    if (this.peerConnections.has(participantId)) {
      console.log('⚠️ Connection already exists for:', participantId);
      return;
    }

    const peerConnection = new RTCPeerConnection(this.configuration);
    this.peerConnections.set(participantId, peerConnection);

    // Add local stream if available
    if (this.localStream) {
      this.addStreamToConnection(peerConnection, this.localStream);
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('📺 Received remote stream from:', participantId);
      const [remoteStream] = event.streams;
      this.onRemoteStream?.(participantId, remoteStream);
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate to:', participantId);
        this.socket.emit('webrtc-ice-candidate', {
          candidate: event.candidate,
          targetSocketId: participantId,
          roomId: this.roomId
        });
      }
    };

    // Monitor connection state
    peerConnection.onconnectionstatechange = () => {
      console.log(`🔗 Connection state with ${participantId}:`, peerConnection.connectionState);
      
      if (peerConnection.connectionState === 'failed') {
        console.log('❌ Connection failed, attempting to restart ICE');
        peerConnection.restartIce();
      }
    };

    // Create and send offer
    try {
      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnection.setLocalDescription(offer);
      
      console.log('📤 Sending WebRTC offer to:', participantId);
      this.socket.emit('webrtc-offer', {
        offer,
        targetSocketId: participantId,
        roomId: this.roomId
      });
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC offer
   */
  private async handleOffer(offer: RTCSessionDescriptionInit, senderSocketId: string) {
    let peerConnection = this.peerConnections.get(senderSocketId);
    
    if (!peerConnection) {
      peerConnection = new RTCPeerConnection(this.configuration);
      this.peerConnections.set(senderSocketId, peerConnection);

      // Add local stream
      if (this.localStream) {
        this.addStreamToConnection(peerConnection, this.localStream);
      }

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('📺 Received remote stream from:', senderSocketId);
        const [remoteStream] = event.streams;
        this.onRemoteStream?.(senderSocketId, remoteStream);
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Sending ICE candidate to:', senderSocketId);
          this.socket.emit('webrtc-ice-candidate', {
            candidate: event.candidate,
            targetSocketId: senderSocketId,
            roomId: this.roomId
          });
        }
      };

      // Monitor connection state
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔗 Connection state with ${senderSocketId}:`, peerConnection.connectionState);
      };
    }

    try {
      await peerConnection.setRemoteDescription(offer);
      
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      console.log('📤 Sending WebRTC answer to:', senderSocketId);
      this.socket.emit('webrtc-answer', {
        answer,
        targetSocketId: senderSocketId,
        roomId: this.roomId
      });
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  }

  /**
   * Handle incoming WebRTC answer
   */
  private async handleAnswer(answer: RTCSessionDescriptionInit, senderSocketId: string) {
    const peerConnection = this.peerConnections.get(senderSocketId);
    
    if (!peerConnection) {
      console.error('❌ No peer connection found for:', senderSocketId);
      return;
    }

    try {
      await peerConnection.setRemoteDescription(answer);
      console.log('✅ WebRTC answer set for:', senderSocketId);
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  }

  /**
   * Handle incoming ICE candidate
   */
  private async handleIceCandidate(candidate: RTCIceCandidateInit, senderSocketId: string) {
    const peerConnection = this.peerConnections.get(senderSocketId);
    
    if (!peerConnection) {
      console.error('❌ No peer connection found for:', senderSocketId);
      return;
    }

    try {
      await peerConnection.addIceCandidate(candidate);
      console.log('✅ ICE candidate added for:', senderSocketId);
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  /**
   * Add local stream to peer connection
   */
  private addStreamToConnection(peerConnection: RTCPeerConnection, stream: MediaStream) {
    stream.getTracks().forEach(track => {
      console.log('➕ Adding track to connection:', track.kind);
      peerConnection.addTrack(track, stream);
    });
  }

  /**
   * Replace video track (for screen sharing)
   */
  async replaceVideoTrack(newVideoTrack: MediaStreamTrack) {
    console.log('🔄 Replacing video track for all connections');
    
    this.peerConnections.forEach(async (peerConnection, participantId) => {
      const sender = peerConnection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      
      if (sender) {
        try {
          await sender.replaceTrack(newVideoTrack);
          console.log('✅ Video track replaced for:', participantId);
        } catch (error) {
          console.error('❌ Error replacing video track for:', participantId, error);
        }
      }
    });

    // Update local stream
    if (this.localStream) {
      const oldVideoTrack = this.localStream.getVideoTracks()[0];
      if (oldVideoTrack) {
        this.localStream.removeTrack(oldVideoTrack);
        oldVideoTrack.stop();
      }
      this.localStream.addTrack(newVideoTrack);
    }
  }

  /**
   * Close connection for a participant
   */
  private closeConnection(participantId: string) {
    const peerConnection = this.peerConnections.get(participantId);
    
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
      console.log('🔒 Connection closed for:', participantId);
    }
  }

  /**
   * Clean up all connections
   */
  cleanup() {
    console.log('🧹 Cleaning up WebRTC connections');
    
    this.peerConnections.forEach((connection, participantId) => {
      connection.close();
    });
    
    this.peerConnections.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Remove socket listeners
    this.socket.off('webrtc-offer');
    this.socket.off('webrtc-answer');
    this.socket.off('webrtc-ice-candidate');
    this.socket.off('user-joined');
    this.socket.off('user-left');
  }
}