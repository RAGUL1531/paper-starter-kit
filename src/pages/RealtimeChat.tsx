import { useState, useEffect, useRef } from 'react';
import { Send, Video, Phone, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { socketService, type User, type ChatMessage } from '@/services/socketService';
import { webRTCService } from '@/services/webRTCService';
import VideoCall from '@/components/VideoCall';
import IncomingCall from '@/components/IncomingCall';

export default function RealtimeChat() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isTyping, setIsTyping] = useState<{ [key: string]: boolean }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [userName, setUserName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  
  // Video call states
  const [inCall, setInCall] = useState(false);
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    callType: 'video' | 'audio';
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isJoined && userName) {
      initializeSocket();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isJoined, userName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeSocket = () => {
    const socket = socketService.connect({
      name: userName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`
    });

    setIsConnected(true);

    // Register WebRTC listeners AFTER socket is connected
    webRTCService.setupSocketListeners();

    // Listen for users update
    socketService.onUsersUpdate((updatedUsers) => {
      setUsers(updatedUsers.filter(u => u.socketId !== socket?.id));
      const current = updatedUsers.find(u => u.socketId === socket?.id);
      if (current) setCurrentUser(current);
    });

    // Listen for messages
    socketService.onMessage((message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing
    socketService.onTyping(({ userId, userName, isTyping: typing }) => {
      setIsTyping(prev => ({ ...prev, [userId]: typing }));
      
      if (typing) {
        setTimeout(() => {
          setIsTyping(prev => ({ ...prev, [userId]: false }));
        }, 3000);
      }
    });

    // Listen for incoming calls
    socketService.onIncomingCall((callData) => {
      setIncomingCall(callData);
    });

    // Listen for call accepted - caller is already in the call,
    // so we don't need to update state here (selectedUser was already set)
    socketService.onCallAccepted(() => {
      console.log('✅ Call accepted by recipient');
    });

    // Listen for call rejected
    socketService.onCallRejected(() => {
      alert('Call was rejected');
    });

    // Listen for call ended
    socketService.onCallEnded(() => {
      setInCall(false);
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsJoined(true);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    socketService.sendMessage(input, selectedUser?.socketId);
    setInput('');
    
    // Clear typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socketService.sendTyping(false, selectedUser?.socketId);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);

    // Send typing indicator
    socketService.sendTyping(true, selectedUser?.socketId);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(false, selectedUser?.socketId);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleVideoCall = (user: User) => {
    setSelectedUser(user);
    socketService.initiateCall(user.socketId, 'video');
    setIsCallInitiator(true);
    setInCall(true);
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) return;

    try {
      // Initialize with audio-only mode (matching VideoCall default)
      await webRTCService.initializeLocalStream(false, true);
    } catch (error) {
      console.error('Error initializing media:', error);
      // Continue anyway - UI will still show
    }
    
    // Accept the call and show UI regardless of media initialization
    socketService.acceptCall(incomingCall.callerId);
    
    // Set the caller as selected user
    const caller = users.find(u => u.socketId === incomingCall.callerId);
    setSelectedUser(caller || null);
    setIsCallInitiator(false);
    setInCall(true);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (incomingCall) {
      socketService.rejectCall(incomingCall.callerId);
      setIncomingCall(null);
    }
  };

  const handleEndCall = () => {
    setInCall(false);
    setSelectedUser(null);
    setIsCallInitiator(false);
  };

  const filteredMessages = selectedUser
    ? messages.filter(
        m =>
          (m.sender.socketId === selectedUser.socketId && m.recipientId === currentUser?.socketId) ||
          (m.sender.socketId === currentUser?.socketId && m.recipientId === selectedUser.socketId)
      )
    : messages.filter(m => !m.recipientId);

  // Join screen
  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Join Chat</h1>
            <p className="text-muted-foreground">Enter your name to start chatting</p>
          </div>
          
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Your name"
              className="text-center text-lg"
              autoFocus
            />
            <Button type="submit" className="w-full" size="lg">
              Join Chat
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Video call screen
  if (inCall && selectedUser) {
    return (
      <VideoCall
        recipientId={selectedUser.socketId}
        recipientName={selectedUser.name}
        isInitiator={isCallInitiator}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCall
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          callType={incomingCall.callType}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Users Sidebar */}
      <Card className="w-80 border-r rounded-none">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="font-semibold">{currentUser?.name}</h2>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>
          </div>
          
          <Button
            variant={selectedUser ? 'outline' : 'default'}
            className="w-full"
            onClick={() => setSelectedUser(null)}
          >
            <Users className="w-4 h-4 mr-2" />
            Group Chat
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="p-2 space-y-1">
            <p className="text-xs text-muted-foreground px-3 py-2">
              Online Users ({users.length})
            </p>
            {users.map((user) => (
              <div
                key={user.socketId}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedUser?.socketId === user.socketId
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{user.name}</p>
                    {isTyping[user.socketId] && (
                      <p className="text-xs text-muted-foreground">typing...</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVideoCall(user);
                    }}
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">
                {selectedUser ? selectedUser.name : 'Group Chat'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedUser ? 'Direct Message' : `${users.length} users online`}
              </p>
            </div>
            {selectedUser && (
              <Button
                size="lg"
                onClick={() => handleVideoCall(selectedUser)}
                className="gap-2"
              >
                <Video className="w-5 h-5" />
                Video Call
              </Button>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredMessages.map((message) => {
              const isOwn = message.sender.socketId === currentUser?.socketId;
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.sender.avatar} />
                    <AvatarFallback>
                      {message.sender.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${isOwn ? 'text-right' : ''}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {!isOwn && (
                        <span className="text-sm font-medium">
                          {message.sender.name}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl max-w-md ${
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {Object.entries(isTyping).map(([userId, typing]) => {
              if (!typing) return null;
              const user = users.find(u => u.socketId === userId);
              if (!user || (selectedUser && userId !== selectedUser.socketId)) return null;
              
              return (
                <div key={userId} className="flex gap-3 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-4 py-2 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${selectedUser ? selectedUser.name : 'everyone'}...`}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim()} size="icon">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
