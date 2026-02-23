import { socketService } from './socketService';

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private screenStream: MediaStream | null = null;
  private recipientId: string | null = null;
  private listenersRegistered = false;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private pendingOffer: { offer: RTCSessionDescriptionInit; senderId: string } | null = null;
  private pendingIceCandidates: RTCIceCandidate[] = [];

  private configuration: RTCConfiguration = {
    iceServers: [
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL,
      },
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL,
      },
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL,
      },
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: import.meta.env.VITE_TURN_USERNAME,
        credential: import.meta.env.VITE_TURN_CREDENTIAL,
      },
    ]
  };

  // Call this AFTER socketService.connect() so the socket exists
  setupSocketListeners() {
    if (this.listenersRegistered) return;
    this.listenersRegistered = true;

    const socket = socketService.getSocket();
    if (!socket) {
      console.error('❌ Cannot setup WebRTC listeners: socket is not connected');
      return;
    }

    // Handle incoming offer (receiver side)
    // Queue the offer — it will be processed when VideoCall mounts and calls processPendingOffer()
    socket.on('webrtc:offer', async (data: { offer: RTCSessionDescriptionInit; senderId: string }) => {
      console.log('📥 Received offer from:', data.senderId);
      this.recipientId = data.senderId;

      // If peer connection already exists (VideoCall already mounted), handle immediately
      if (this.peerConnection && this.localStream) {
        console.log('📥 Handling offer immediately (VideoCall already active)');
        await this.handleOffer(data.offer);
      } else {
        // Queue the offer for later processing
        console.log('📥 Queuing offer (waiting for VideoCall to mount)');
        this.pendingOffer = { offer: data.offer, senderId: data.senderId };
      }
    });

    // Handle answer (caller side)
    socket.on('webrtc:answer', async (data: { answer: RTCSessionDescriptionInit; senderId: string }) => {
      console.log('📥 Received answer from:', data.senderId);
      await this.handleAnswer(data.answer);
    });

    // Handle ICE candidate
    socket.on('webrtc:ice-candidate', async (data: { candidate: RTCIceCandidate; senderId: string }) => {
      console.log('📥 Received ICE candidate from:', data.senderId);
      if (this.peerConnection) {
        await this.handleIceCandidate(data.candidate);
      } else {
        // Queue ICE candidates until peer connection is ready
        this.pendingIceCandidates.push(data.candidate);
      }
    });

    console.log('✅ WebRTC socket listeners registered');
  }

  // Called by VideoCall after it mounts and sets up the stream
  async processPendingOffer() {
    if (this.pendingOffer) {
      console.log('📥 Processing queued offer from:', this.pendingOffer.senderId);
      this.recipientId = this.pendingOffer.senderId;
      await this.handleOffer(this.pendingOffer.offer);
      this.pendingOffer = null;
    }

    // Process any queued ICE candidates
    if (this.pendingIceCandidates.length > 0 && this.peerConnection) {
      console.log(`📥 Processing ${this.pendingIceCandidates.length} queued ICE candidates`);
      for (const candidate of this.pendingIceCandidates) {
        await this.handleIceCandidate(candidate);
      }
      this.pendingIceCandidates = [];
    }
  }

  onRemoteStream(callback: (stream: MediaStream) => void) {
    this.onRemoteStreamCallback = callback;
  }

  async initializeLocalStream(videoEnabled = true, audioEnabled = true): Promise<MediaStream> {
    // Don't re-initialize if we already have a stream
    if (this.localStream) {
      console.log('ℹ️ Local stream already exists, reusing');
      return this.localStream;
    }

    try {
      // ALWAYS request both video and audio so the peer connection
      // has video senders from the start (avoids renegotiation later)
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Disable video track if caller doesn't want video initially
      if (!videoEnabled) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = false;
        });
      }

      // Disable audio track if caller doesn't want audio initially
      if (!audioEnabled) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = false;
        });
      }

      console.log('✅ Local stream initialized (video:', videoEnabled, ', audio:', audioEnabled, ')');
      return this.localStream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      throw error;
    }
  }

  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Add local stream tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.recipientId) {
        console.log('📤 Sending ICE candidate');
        socketService.sendIceCandidate(this.recipientId, event.candidate);
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📥 Received remote track:', event.track.kind);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach(track => {
        this.remoteStream?.addTrack(track);
      });
      // Notify UI about the remote stream
      if (this.remoteStream && this.onRemoteStreamCallback) {
        console.log('📥 Notifying UI about remote stream');
        this.onRemoteStreamCallback(this.remoteStream);
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('🔗 Connection state:', this.peerConnection?.connectionState);
    };

    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state:', this.peerConnection?.iceConnectionState);
    };

    return this.peerConnection;
  }

  async createOffer(recipientId: string) {
    this.recipientId = recipientId;
    
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    try {
      const offer = await this.peerConnection!.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await this.peerConnection!.setLocalDescription(offer);
      console.log('📤 Sending offer');
      socketService.sendOffer(recipientId, offer);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      throw error;
    }
  }

  private async handleOffer(offer: RTCSessionDescriptionInit) {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }

    try {
      await this.peerConnection!.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      
      console.log('📤 Sending answer');
      socketService.sendAnswer(this.recipientId!, answer);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      throw error;
    }
  }

  private async handleAnswer(answer: RTCSessionDescriptionInit) {
    try {
      await this.peerConnection?.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Answer set successfully');
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      throw error;
    }
  }

  private async handleIceCandidate(candidate: RTCIceCandidate) {
    try {
      await this.peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      console.log('✅ ICE candidate added');
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  }

  // Media controls
  toggleVideo(enabled: boolean) {
    if (!this.localStream) return;
    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
    if (this.recipientId) {
      socketService.toggleVideo(this.recipientId, enabled);
    }
  }

  toggleAudio(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
      if (this.recipientId) {
        socketService.toggleAudio(this.recipientId, enabled);
      }
    }
  }

  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      // Replace video track with screen share track
      const screenTrack = this.screenStream.getVideoTracks()[0];
      const sender = this.peerConnection
        ?.getSenders()
        .find(s => s.track?.kind === 'video');

      if (sender) {
        sender.replaceTrack(screenTrack);
      }

      if (this.recipientId) {
        socketService.startScreenShare(this.recipientId);
      }

      // Handle screen share stop
      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      return this.screenStream;
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop());
      this.screenStream = null;

      // Switch back to camera
      if (this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        const sender = this.peerConnection
          ?.getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }

      if (this.recipientId) {
        socketService.stopScreenShare(this.recipientId);
      }
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  getRemoteStream() {
    return this.remoteStream;
  }

  isScreenSharing() {
    return this.screenStream !== null;
  }

  // Cleanup
  async endCall() {
    // Stop all tracks
    this.localStream?.getTracks().forEach(track => track.stop());
    this.screenStream?.getTracks().forEach(track => track.stop());

    // Close peer connection
    this.peerConnection?.close();

    // Reset ALL state for a fresh next call
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.peerConnection = null;
    this.recipientId = null;
    this.onRemoteStreamCallback = null;
    this.pendingOffer = null;
    this.pendingIceCandidates = [];

    console.log('✅ Call ended and cleaned up');
  }
}

export const webRTCService = new WebRTCService();
