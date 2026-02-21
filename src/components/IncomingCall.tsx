import { Phone, PhoneOff, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface IncomingCallProps {
  callerName: string;
  callerAvatar?: string;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onReject: () => void;
}

export default function IncomingCall({
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onReject
}: IncomingCallProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md p-8 text-center space-y-6 animate-scale-in">
        {/* Caller Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-primary animate-pulse">
              <AvatarImage src={callerAvatar} alt={callerName} />
              <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {callerName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
              {callType === 'video' ? (
                <Video className="w-5 h-5 text-primary-foreground" />
              ) : (
                <Phone className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
          </div>
        </div>

        {/* Caller Info */}
        <div>
          <h2 className="text-2xl font-bold mb-2">{callerName}</h2>
          <p className="text-muted-foreground">
            Incoming {callType} call...
          </p>
        </div>

        {/* Call Actions */}
        <div className="flex items-center justify-center gap-6 pt-4">
          {/* Reject */}
          <Button
            onClick={onReject}
            size="lg"
            variant="destructive"
            className="rounded-full w-16 h-16 hover:scale-110 transition-transform"
          >
            <PhoneOff className="w-7 h-7" />
          </Button>

          {/* Accept */}
          <Button
            onClick={onAccept}
            size="lg"
            className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 hover:scale-110 transition-transform"
          >
            <Phone className="w-7 h-7" />
          </Button>
        </div>

        {/* Ringing Animation */}
        <div className="flex justify-center gap-1 pt-2">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </Card>
    </div>
  );
}
