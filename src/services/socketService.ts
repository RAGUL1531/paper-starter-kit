import { io, Socket } from 'socket.io-client';

export interface User {
  socketId: string;
  name: string;
  avatar?: string;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: User;
  recipientId?: string;
  timestamp: string;
}

export interface CallData {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'video' | 'audio';
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = import.meta.env.VITE_SOCKET_URL || 'https://paper-starter-kit.onrender.com';

  connect(userData: { name: string; avatar?: string }) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.socket?.emit('user:join', userData);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  // ============ CHAT METHODS ============

  sendMessage(content: string, recipientId?: string) {
    this.socket?.emit('chat:message', {
      content,
      recipientId
    });
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.socket?.on('chat:message', callback);
  }

  sendTyping(isTyping: boolean, recipientId?: string) {
    this.socket?.emit('chat:typing', {
      isTyping,
      recipientId
    });
  }

  onTyping(callback: (data: { userId: string; userName: string; isTyping: boolean }) => void) {
    this.socket?.on('chat:typing', callback);
  }

  onUsersUpdate(callback: (users: User[]) => void) {
    this.socket?.on('users:update', callback);
  }

  // ============ VIDEO CALL METHODS ============

  initiateCall(recipientId: string, callType: 'video' | 'audio' = 'video') {
    this.socket?.emit('call:initiate', {
      recipientId,
      callType
    });
  }

  acceptCall(callerId: string) {
    this.socket?.emit('call:accept', { callerId });
  }

  rejectCall(callerId: string) {
    this.socket?.emit('call:reject', { callerId });
  }

  endCall(recipientId: string) {
    this.socket?.emit('call:end', { recipientId });
  }

  onIncomingCall(callback: (data: CallData) => void) {
    this.socket?.on('call:incoming', callback);
  }

  onCallAccepted(callback: (data: { recipientId: string }) => void) {
    this.socket?.on('call:accepted', callback);
  }

  onCallRejected(callback: (data: { recipientId: string }) => void) {
    this.socket?.on('call:rejected', callback);
  }

  onCallEnded(callback: (data: { userId: string }) => void) {
    this.socket?.on('call:ended', callback);
  }

  // ============ WebRTC SIGNALING ============

  sendOffer(recipientId: string, offer: RTCSessionDescriptionInit) {
    this.socket?.emit('webrtc:offer', {
      recipientId,
      offer
    });
  }

  sendAnswer(recipientId: string, answer: RTCSessionDescriptionInit) {
    this.socket?.emit('webrtc:answer', {
      recipientId,
      answer
    });
  }

  sendIceCandidate(recipientId: string, candidate: RTCIceCandidate) {
    this.socket?.emit('webrtc:ice-candidate', {
      recipientId,
      candidate
    });
  }

  onOffer(callback: (data: { offer: RTCSessionDescriptionInit; senderId: string }) => void) {
    this.socket?.on('webrtc:offer', callback);
  }

  onAnswer(callback: (data: { answer: RTCSessionDescriptionInit; senderId: string }) => void) {
    this.socket?.on('webrtc:answer', callback);
  }

  onIceCandidate(callback: (data: { candidate: RTCIceCandidate; senderId: string }) => void) {
    this.socket?.on('webrtc:ice-candidate', callback);
  }

  // ============ MEDIA CONTROLS ============

  toggleVideo(recipientId: string, enabled: boolean) {
    this.socket?.emit('call:toggle-video', { recipientId, enabled });
  }

  toggleAudio(recipientId: string, enabled: boolean) {
    this.socket?.emit('call:toggle-audio', { recipientId, enabled });
  }

  onPeerVideoToggle(callback: (data: { userId: string; enabled: boolean }) => void) {
    this.socket?.on('call:peer-video-toggle', callback);
  }

  onPeerAudioToggle(callback: (data: { userId: string; enabled: boolean }) => void) {
    this.socket?.on('call:peer-audio-toggle', callback);
  }

  // ============ SCREEN SHARING ============

  startScreenShare(recipientId: string) {
    this.socket?.emit('screen:share-start', { recipientId });
  }

  stopScreenShare(recipientId: string) {
    this.socket?.emit('screen:share-stop', { recipientId });
  }

  onScreenShareStarted(callback: (data: { userId: string }) => void) {
    this.socket?.on('screen:share-started', callback);
  }

  onScreenShareStopped(callback: (data: { userId: string }) => void) {
    this.socket?.on('screen:share-stopped', callback);
  }

  // ============ CLEANUP ============

  removeAllListeners() {
    this.socket?.removeAllListeners();
  }
}

export const socketService = new SocketService();
