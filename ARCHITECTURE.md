# WebSocket Chat & Video Call Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │  RealtimeChat    │         │   VideoCall      │            │
│  │  Component       │         │   Component      │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                             │                       │
│           ├─────────────────────────────┤                      │
│           │                             │                       │
│  ┌────────▼─────────┐         ┌────────▼─────────┐            │
│  │  socketService   │         │  webRTCService   │            │
│  │  (WebSocket)     │         │  (Peer-to-Peer)  │            │
│  └────────┬─────────┘         └────────┬─────────┘            │
│           │                             │                       │
└───────────┼─────────────────────────────┼───────────────────────┘
            │                             │
            │ Socket.io                   │ WebRTC
            │ (Signaling)                 │ (Media Stream)
            │                             │
┌───────────▼─────────────────────────────▼───────────────────────┐
│                      WEBSOCKET SERVER                           │
│                    (Node.js + Socket.io)                        │
│                     Port: 3001                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  • User Management                                              │
│  • Message Routing                                              │
│  • WebRTC Signaling (Offer/Answer/ICE)                         │
│  • Typing Indicators                                            │
│  • Call Management                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Communication Flow

### Chat Message Flow

```
User A                  Server                  User B
  │                       │                       │
  ├──── Send Message ────▶│                       │
  │                       ├──── Broadcast ───────▶│
  │                       │                       │
  │◀──── Confirmation ────┤                       │
  │                       │                       │
```

### Video Call Flow

```
Caller                  Server                  Callee
  │                       │                       │
  ├─ 1. Initiate Call ───▶│                       │
  │                       ├─ 2. Incoming Call ───▶│
  │                       │                       │
  │                       │◀─ 3. Accept Call ─────┤
  │◀─ 4. Call Accepted ───┤                       │
  │                       │                       │
  ├─ 5. WebRTC Offer ────▶│                       │
  │                       ├─ 6. Forward Offer ───▶│
  │                       │                       │
  │                       │◀─ 7. WebRTC Answer ───┤
  │◀─ 8. Forward Answer ──┤                       │
  │                       │                       │
  ├─ 9. ICE Candidates ──▶│                       │
  │                       ├─ 10. Forward ICE ────▶│
  │                       │                       │
  │◀══════════════════════════════════════════════│
  │         Direct P2P Connection (WebRTC)        │
  │         Audio/Video Stream                    │
  └───────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Socket.io Client** - WebSocket communication
- **WebRTC API** - Peer-to-peer video/audio
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server
- **Socket.io** - WebSocket server
- **CORS** - Cross-origin support

## Key Components

### 1. socketService.ts
Manages WebSocket connections and events:
- User join/leave
- Message sending/receiving
- Typing indicators
- Call signaling

### 2. webRTCService.ts
Handles peer-to-peer connections:
- Media stream management
- Peer connection setup
- ICE candidate exchange
- Screen sharing

### 3. RealtimeChat.tsx
Main chat interface:
- User list
- Message display
- Input handling
- Call initiation

### 4. VideoCall.tsx
Video call interface:
- Video display (local & remote)
- Media controls
- Call duration
- Screen sharing

### 5. server.js
WebSocket server:
- Connection handling
- Message routing
- User management
- Signaling relay

## Data Flow

### Message Object
```typescript
{
  id: string;
  content: string;
  sender: User;
  recipientId?: string;  // Optional for direct messages
  timestamp: string;
}
```

### User Object
```typescript
{
  socketId: string;
  name: string;
  avatar?: string;
  online: boolean;
}
```

### Call Data
```typescript
{
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'video' | 'audio';
}
```

## Security Considerations

### Current Implementation
- ✅ CORS configured
- ✅ Input validation
- ✅ Secure WebSocket connection

### Production Requirements
- 🔒 HTTPS/WSS (required for WebRTC)
- 🔒 User authentication
- 🔒 Message encryption
- 🔒 Rate limiting
- 🔒 TURN server authentication

## Scalability

### Current Setup
- Single server instance
- In-memory user storage
- No message persistence

### Production Scaling
- Load balancer
- Redis for session storage
- Database for message history
- Multiple server instances
- CDN for static assets

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebSocket | ✅ | ✅ | ✅ | ✅ |
| WebRTC | ✅ | ✅ | ✅ | ✅ |
| Screen Share | ✅ | ✅ | ⚠️ | ✅ |

⚠️ Safari has limited screen sharing support

## Network Requirements

### Ports
- **5173** - Frontend dev server (Vite)
- **3001** - WebSocket server

### Protocols
- **HTTP/HTTPS** - Web server
- **WebSocket (WS/WSS)** - Real-time communication
- **UDP** - WebRTC media streams

### Firewall
- Allow outbound connections to STUN servers
- Configure TURN server for restrictive networks
