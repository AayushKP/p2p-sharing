# P2P File Sharing Application

A peer-to-peer file sharing application built with React, TypeScript, WebRTC, and WebSocket. Share files directly between browsers without uploading to any server.

## Features

- **Secure P2P Transfer** - Files transfer directly between peers using WebRTC DataChannel
- **Fast & Efficient** - No server bottleneck, direct peer-to-peer connection
- **Real-time Progress** - Live upload/download progress tracking
- **Multi-user Support** - See all online users and connect with any of them
- **Simple UI** - Clean, intuitive interface built with React and TailwindCSS
- **Large File Support** - Chunked transfer with backpressure handling
- **Connection Requests** - Accept/reject connection requests with modal dialogs

## Architecture

```
┌─────────────┐                                    ┌─────────────┐
│   User A    │◄──────── WebRTC DataChannel ──────►│   User B    │
│  (Browser)  │              (P2P Transfer)        |  (Browser)  │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │              WebSocket (Signaling Only)          │
       │                        │                         │
       └────────────────────────┼─────────────────────────┘
                                │
                        ┌───────▼────────┐
                        │ Signaling      │
                        │ Server         │
                        │ (Node.js + WS) │
                        └────────────────┘
```

### Tech Stack

**Frontend:**

- React 18 with TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- WebRTC (P2P connections)
- WebSocket (Signaling)

**Backend:**

- Node.js + Express
- ws (WebSocket library)
- TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser with WebRTC support (Chrome, Firefox, Edge, Safari)

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd p2psharing
```

### 2. Setup Server

```bash
cd server
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and set your port
PORT=3001

# Start the server
npm run build
npm start
```

The WebSocket server will start and listen for connections on port 3001. Note that this is a WebSocket server, not an HTTP server, so you won't be able to access it via a browser at `http://localhost:3001`.

### 3. Setup Client

```bash
cd client
npm install

# Create .env file from example
copy .env.example .env

# Edit .env and set your WebSocket URL
VITE_WS_URL=ws://localhost:3001

# Start the development server
npm run dev
```

Client will start on `http://localhost:5173`

### 4. Test P2P Transfer

1. Open two browser tabs (or different browsers)
2. Both tabs will connect to the signaling server
3. You'll see each other in the "Online Users" list
4. Click on a user to send a connection request
5. Accept the request in the other tab
6. Once connected, select a file and transfer

## Project Structure

```
p2psharing/
├── server/                     # Signaling server
│   ├── src/
│   │   ├── server.ts          # WebSocket server implementation
│   │   └── types.ts           # TypeScript types
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── FileTransfer.tsx    # File transfer UI
│   │   ├── context/
│   │   │   └── WebSocketContext.tsx # Global state management
│   │   ├── core/
│   │   │   ├── ws.ts              # WebSocket client
│   │   │   └── webrtc.ts          # WebRTC manager
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
└── README.md
```

## How It Works

### Connection Flow

```
1. User A connects to WebSocket server
   ↓
2. User B connects to WebSocket server
   ↓
3. Server broadcasts online users list
   ↓
4. User A clicks on User B (sends connection request)
   ↓
5. User B accepts the request
   ↓
6. Server sends webrtc-start signal to both users
   ↓
7. WebRTC handshake begins
   ├── User A creates offer
   ├── User B creates answer
   └── ICE candidates exchanged
   ↓
8. DataChannel opens (P2P connection established)
   ↓
9. File transfer happens directly between peers
```

### File Transfer Protocol:

### Sending Process

```
1. Sender selects file
   ↓
2. Validate DataChannel is open
   ↓
3. Send META message with file info (name, size, type)
   ↓
4. Read file in 64KB chunks using FileReader
   ↓
5. Send each chunk as ArrayBuffer via DataChannel
   ↓
6. Monitor bufferedAmount for backpressure
   ├── If buffer > 1MB threshold, pause sending
   └── Resume when onbufferedamountlow fires
   ↓
7. Report progress via onSendProgress callback
   ↓
8. Send DONE message when all chunks sent
```

### Receiving Process

```
1. Receive META message
   ├── Store file metadata (name, size, type)
   └── Initialize empty buffer array
   ↓
2. Receive binary chunks
   ├── Convert ArrayBuffer to Uint8Array
   ├── Push to receivedBuffers array
   ├── Track receivedSize
   └── Report progress via onReceiveProgress callback
   ↓
3. Receive DONE message
   ├── Create Blob from all chunks
   ├── Create File object with original filename
   └── Trigger onFileReceived callback
   ↓
4. UI creates download URL via URL.createObjectURL()
   ↓
5. User clicks download button to save file
```

## Usage

### Basic File Transfer

1. **Connect**: Users appear in the sidebar when online
2. **Request**: Click on a user's name to send connection request
3. **Accept**: Other user accepts the request via modal
4. **Transfer**: Use "Choose File" button to select and send files
5. **Download**: Receiver gets download button when transfer completes

### Multiple Transfers

- Currently supports one active connection per user
- Disconnect current peer to connect with another user
- Multiple transfers can happen sequentially

## Environment Variables

### Server (.env)

```env
PORT=3001                    # WebSocket server port
```

### Client (.env)

```env
VITE_WS_URL=ws://localhost:3001    # WebSocket server URL
```

**Note**: In production, use `wss://` (secure WebSocket) instead of `ws://`

---

Made with React, TypeScript, and WebRTC
