import { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { webRTCService } from '@/services/webRTCService';
import { socketService } from '@/services/socketService';

interface VideoCallProps {
  recipientId: string;
  recipientName: string;
  isInitiator: boolean; // true = caller (creates offer), false = receiver (waits for offer)
  onEndCall: () => void;
}

export default function VideoCall({ recipientId, recipientName, isInitiator, onEndCall }: VideoCallProps) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // Start with video ON
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [peerVideoEnabled, setPeerVideoEnabled] = useState(true); // Assume peer also starts with video on
  const [peerAudioEnabled, setPeerAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTimeRef = useRef<number>(Date.now());
  const initializedRef = useRef(false);

  useEffect(() => {
    // Guard against React strict mode double-mount
    if (!initializedRef.current) {
      initializedRef.current = true;
      initializeCall();
    }
    setupEventListeners();

    // Call duration timer
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
    }, 1000);

    return () => {
      clearInterval(timer);
      // Do NOT call webRTCService.endCall() here!
      // React strict mode double-mounts would destroy the connection.
      // Cleanup only happens via the explicit End Call button.
    };
  }, []);

  const initializeCall = async () => {
    try {
      // Get local media stream - VIDEO + AUDIO
      const stream = await webRTCService.initializeLocalStream(true, true);
      
      // Display local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Register callback for remote stream
      webRTCService.onRemoteStream((remoteStream) => {
        console.log('🎥 Remote stream received in VideoCall UI');
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      // Only the caller creates the offer; the receiver processes any queued offer
      if (isInitiator) {
        console.log('📞 Initiator: creating offer...');
        await webRTCService.createOffer(recipientId);
      } else {
        console.log('📞 Receiver: processing any pending offer...');
        // Now that stream is ready and callback is registered, process the queued offer
        await webRTCService.processPendingOffer();
      }

      // Also poll for remote stream as a fallback
      const checkRemoteStream = setInterval(() => {
        const remoteStream = webRTCService.getRemoteStream();
        if (remoteStream && remoteVideoRef.current && !remoteVideoRef.current.srcObject) {
          remoteVideoRef.current.srcObject = remoteStream;
          clearInterval(checkRemoteStream);
        }
      }, 500);

      // Clear interval after 30 seconds
      setTimeout(() => clearInterval(checkRemoteStream), 30000);
    } catch (error) {
      console.error('Error initializing call:', error);
      // Don't show alert, just log the error - call can continue with audio only
      console.log('Continuing with audio-only mode');
    }
  };

  const setupEventListeners = () => {
    // Listen for peer media toggles
    socketService.onPeerVideoToggle(({ enabled }) => {
      setPeerVideoEnabled(enabled);
    });

    socketService.onPeerAudioToggle(({ enabled }) => {
      setPeerAudioEnabled(enabled);
    });

    // Listen for call end
    socketService.onCallEnded(() => {
      handleEndCall();
    });
  };

  const handleToggleVideo = () => {
    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);
    webRTCService.toggleVideo(newState);
  };

  const handleToggleAudio = () => {
    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);
    webRTCService.toggleAudio(newState);
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await webRTCService.stopScreenShare();
        setIsScreenSharing(false);
      } else {
        await webRTCService.startScreenShare();
        setIsScreenSharing(true);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const handleEndCall = async () => {
    await webRTCService.endCall();
    socketService.endCall(recipientId);
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Remote Video (Main) */}
      <div className="relative w-full h-full">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {!peerVideoEnabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-white">
                  {recipientName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-white text-lg">{recipientName}</p>
              <p className="text-gray-400 text-sm mt-2">Camera is off</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        <Card className="absolute top-4 right-4 w-48 h-36 overflow-hidden border-2 border-white shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <VideoOff className="w-8 h-8 text-white" />
            </div>
          )}
        </Card>

        {/* Call Info */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md rounded-lg px-4 py-2">
          <p className="text-white font-medium">{recipientName}</p>
          <p className="text-gray-300 text-sm">{formatDuration(callDuration)}</p>
        </div>

        {/* Audio Indicator */}
        {!peerAudioEnabled && (
          <div className="absolute top-20 left-4 bg-red-500/80 backdrop-blur-md rounded-lg px-3 py-1">
            <p className="text-white text-sm flex items-center gap-2">
              <MicOff className="w-4 h-4" />
              Muted
            </p>
          </div>
        )}

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500/80 backdrop-blur-md rounded-lg px-4 py-2">
            <p className="text-white text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              You are sharing your screen
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center gap-4 bg-black/70 backdrop-blur-md rounded-full px-6 py-4">
            {/* Toggle Audio */}
            <Button
              onClick={handleToggleAudio}
              size="lg"
              variant={isAudioEnabled ? "secondary" : "destructive"}
              className="rounded-full w-14 h-14"
            >
              {isAudioEnabled ? (
                <Mic className="w-6 h-6" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>

            {/* Toggle Video */}
            <Button
              onClick={handleToggleVideo}
              size="lg"
              variant={isVideoEnabled ? "secondary" : "destructive"}
              className="rounded-full w-14 h-14"
            >
              {isVideoEnabled ? (
                <Video className="w-6 h-6" />
              ) : (
                <VideoOff className="w-6 h-6" />
              )}
            </Button>

            {/* End Call */}
            <Button
              onClick={handleEndCall}
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
            >
              <PhoneOff className="w-7 h-7" />
            </Button>

            {/* Screen Share */}
            <Button
              onClick={handleScreenShare}
              size="lg"
              variant={isScreenSharing ? "default" : "secondary"}
              className="rounded-full w-14 h-14"
            >
              <Monitor className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
