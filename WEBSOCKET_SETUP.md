# WebSocket Chat & Video Call Setup Guide

This guide will help you set up and run the real-time chat and video calling features in your application.

## 🎯 Features Implemented

### Real-time Chat
- ✅ WebSocket-based instant messaging
- ✅ Direct messaging (1-on-1)
- ✅ Group chat
- ✅ Typing indicators
- ✅ Online user status
- ✅ Message history
- ✅ User avatars

### Video Calling
- ✅ Peer-to-peer video calls using WebRTC
- ✅ Audio-only calls
- ✅ Video toggle (camera on/off)
- ✅ Audio toggle (microphone mute/unmute)
- ✅ Screen sharing
- ✅ Call notifications (incoming call UI)
- ✅ Call duration timer
- ✅ Picture-in-picture local video

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)
- Camera and microphone permissions

## 🚀 Installation & Setup

### Step 1: Install Frontend Dependencies

```bash
cd c:\Users\Ragul P\paper-starter-kit
npm install
```

This will install the newly added `socket.io-client` dependency.

### Step 2: Install Backend Dependencies

```bash
cd server
npm install
```

This will install:
- `express` - Web server framework
- `socket.io` - WebSocket library
- `cors` - Cross-origin resource sharing

### Step 3: Start the WebSocket Server

In a **separate terminal**, run:

```bash
cd c:\Users\Ragul P\paper-starter-kit\server
npm start
```

You should see:
```
🚀 WebSocket server running on http://localhost:3001
📡 Socket.io ready for connections
```

### Step 4: Start the Frontend Development Server

In your **main terminal**, run:

```bash
cd c:\Users\Ragul P\paper-starter-kit
npm run dev
```

### Step 5: Access the Chat

Open your browser and navigate to:
```
http://localhost:5173/chat
```

## 🎮 How to Use

### Starting a Chat

1. **Enter your name** on the join screen
2. Click "Join Chat" to enter the chat room
3. You'll see a list of online users on the left sidebar

### Sending Messages

- **Group Chat**: Click "Group Chat" button and type your message
- **Direct Message**: Click on a user in the sidebar, then type your message
- Messages appear in real-time for all participants
- Typing indicators show when someone is typing

### Making a Video Call

1. **Select a user** from the sidebar
2. Click the **video icon** next to their name, OR
3. Click the **"Video Call"** button in the chat header
4. Wait for the other user to accept

### During a Video Call

- **Toggle Video**: Click the video icon to turn camera on/off
- **Toggle Audio**: Click the microphone icon to mute/unmute
- **Screen Share**: Click the monitor icon to share your screen
- **End Call**: Click the red phone icon to end the call

### Accepting an Incoming Call

1. You'll see a popup with the caller's information
2. Click the **green phone icon** to accept
3. Click the **red phone icon** to reject

## 🏗️ Architecture

### Frontend Components

```
src/
├── services/
│   ├── socketService.ts      # WebSocket client wrapper
│   └── webRTCService.ts       # WebRTC peer connection handler
├── components/
│   ├── VideoCall.tsx          # Video call UI
│   └── IncomingCall.tsx       # Incoming call notification
└── pages/
    └── RealtimeChat.tsx       # Main chat page
```

### Backend Server

```
server/
├── server.js                  # WebSocket server with Socket.io
└── package.json              # Server dependencies
```

## 🔧 Configuration

### Server Port

The WebSocket server runs on port **3001** by default. To change it:

Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to your preferred port
```

Then update the frontend connection URL in `src/services/socketService.ts`:
```typescript
private serverUrl = 'http://localhost:3001'; // Update to match server port
```

### STUN/TURN Servers

For better connectivity across different networks, you can add TURN servers in `src/services/webRTCService.ts`:

```typescript
private configuration: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    // Add your TURN server here
    {
      urls: 'turn:your-turn-server.com:3478',
      username: 'your-username',
      credential: 'your-password'
    }
  ]
};
```

## 🧪 Testing

### Testing with Multiple Users

1. Open the chat in **multiple browser windows** or **different browsers**
2. Use different names for each user
3. Try sending messages and making calls between users

### Testing on Different Devices

1. Make sure both devices are on the **same network**
2. Find your computer's local IP address:
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`
3. Update the `serverUrl` in `socketService.ts` to use your IP:
   ```typescript
   private serverUrl = 'http://192.168.1.XXX:3001'; // Replace with your IP
   ```
4. Access the app from other devices using: `http://192.168.1.XXX:5173/chat`

## 🐛 Troubleshooting

### WebSocket Connection Issues

**Problem**: "Disconnected from WebSocket server"

**Solutions**:
1. Make sure the server is running (`npm start` in the `server` folder)
2. Check if port 3001 is available
3. Verify the `serverUrl` in `socketService.ts` matches your server

### Video Call Not Working

**Problem**: Camera/microphone not accessible

**Solutions**:
1. Grant browser permissions for camera and microphone
2. Use HTTPS in production (WebRTC requires secure context)
3. Check if camera/microphone is being used by another application

**Problem**: Can't see remote video

**Solutions**:
1. Check browser console for errors
2. Verify both users have granted camera permissions
3. Try refreshing both browser windows
4. Check firewall settings

### No Audio/Video

**Problem**: Peer connection fails

**Solutions**:
1. Check if you're behind a restrictive firewall
2. Configure TURN servers for NAT traversal
3. Verify ICE candidates are being exchanged (check console logs)

## 🔒 Security Considerations

### For Production

1. **Use HTTPS**: WebRTC requires secure context in production
2. **Implement Authentication**: Add user authentication to prevent unauthorized access
3. **Rate Limiting**: Prevent spam and abuse
4. **Message Validation**: Sanitize and validate all messages
5. **TURN Server**: Use authenticated TURN servers
6. **CORS**: Configure proper CORS policies

## 📚 Additional Resources

- [Socket.io Documentation](https://socket.io/docs/v4/)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [React Documentation](https://react.dev/)

## 🎨 Customization

### Styling

All components use Tailwind CSS and shadcn/ui components. You can customize:
- Colors in `tailwind.config.ts`
- Component styles in individual component files
- Animations and transitions

### Adding Features

You can extend the functionality by:
- Adding file sharing
- Implementing message reactions
- Adding message search
- Creating chat rooms
- Adding user profiles
- Implementing message encryption

## 📝 Notes

- The current implementation stores messages in memory (they're lost on refresh)
- For production, consider adding a database for message persistence
- Video quality adapts to network conditions automatically
- Screen sharing works best on Chrome and Edge browsers

## 🤝 Support

If you encounter any issues:
1. Check the browser console for errors
2. Check the server terminal for logs
3. Verify all dependencies are installed
4. Make sure both frontend and backend servers are running

---

**Enjoy your real-time chat and video calling experience! 🎉**
