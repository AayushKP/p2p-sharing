# P2P File Sharing Application - Architecture and Process

## 1. Overview

The application is a peer-to-peer file sharing platform built with React, TypeScript, WebRTC, and WebSockets. It enables users to share files directly between their browsers over encrypted, serverless transfers.

## 2. Core Architecture

The architecture relies on a hybrid approach:

- **Signaling Server:** A Node.js + WebSocket server (implemented in [server.ts](server/src/server.ts)) used solely for discovery (finding other users) and connection setup (signaling). It does not store or process the transferred files.
- **Client Application:** A React frontend that manages the user interface, connects to the signaling server, and establishes direct Peer-to-Peer (P2P) connections via WebRTC DataChannels.

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

## 3. How It Works: Connection Flow

Before two users can share files, they need to establish a P2P connection. This process uses the signaling server to exchange connection information.

1. **Discovery & Registration:**
   - Both users (User A and User B) connect to the WebSocket server using the [ws.ts](client/src/core/ws.ts#L1) file. Users can register custom display names (`register-name`) and device details (`register-device`).
   - The signaling server broadcasts the list of all online users (with device details). In the client, this is received and updated via the `ws.onmessage` handler's `online-users` event in [WebSocketContext.tsx](client/src/context/WebSocketContext.tsx#L104).
2. **Request:**
   - User A selects User B from the online list to initiate a connection. This triggers [sendConnectionRequest](client/src/context/WebSocketContext.tsx#L205), which sends a `request-connection` socket message.
   - The connection request is forwarded directly to User B via the WebSocket server. User B receives the `incoming-request` event in [WebSocketContext.tsx](client/src/context/WebSocketContext.tsx#L110).
   - Alternatively, User A can cancel (`cancel-connection`) or User B can reject (`reject-connection`) the request.
3. **Acceptance:**
   - User B accepts the connection request, triggering [acceptRequest](client/src/context/WebSocketContext.tsx#L211), which sends an `accept-connection` message back to the server.
4. **WebRTC Handshake:**
   - The server instructs both users to start the WebRTC process by broadcasting the `webrtc-start` event (handled in [WebSocketContext.tsx](client/src/context/WebSocketContext.tsx#L140)).
   - Both clients instantiate a new [webrtc.ts](client/src/core/webrtc.ts#L7) connection manager.
   - **Caller (User A):** Creates a connection offer via [createOffer](client/src/core/webrtc.ts#L200) (which implicitly invokes [createDataChannel](client/src/core/webrtc.ts#L89) to create the WebRTC DataChannel) and sends it as a WebSocket `offer` message.
   - **Receiver (User B):** Receives the offer socket event (handled in [WebSocketContext.tsx](client/src/context/WebSocketContext.tsx#L180)), sets the remote description using [setRemoteDescription](client/src/core/webrtc.ts#L215), generates an answer with [createAnswer](client/src/core/webrtc.ts#L207), and sends it back to the caller.
   - **ICE Exchange:** As both peers generate network candidates, they trigger `onIceCandidate` in [WebSocketContext.tsx](client/src/context/WebSocketContext.tsx#L149) to exchange ICE candidates through the signaling server, adding them via [addIceCandidate](client/src/core/webrtc.ts#L224).
5. **Direct Connection Established:**
   - The WebRTC DataChannel opens, changing the connection state. The browser fires the channel's `onopen` callback (defined in [setupSenderChannel](client/src/core/webrtc.ts#L99) and [setupReceiverChannel](client/src/core/webrtc.ts#L130)), setting `isChannelOpen = true` and calling the UI hook `onConnected()`.

## 4. File Transfer Process

Once the DataChannel is open, the file transfer happens entirely peer-to-peer.

### Sending a File

The sender calls [sendFile](client/src/core/webrtc.ts#L233) within the [webrtc.ts](client/src/core/webrtc.ts#L7) manager:

1. **Selection:** The sender selects a file from the UI.
2. **Metadata:** A `META` message containing the filename, size, and content type is serialized and sent over the DataChannel.
3. **Chunking & Transmission:** The file is sliced into 64KB blocks (`CHUNK_SIZE = 64 * 1024`) and sent as `ArrayBuffer` objects inside a loop.
4. **Flow Control (Backpressure):** To prevent overloading the peer's memory, the method monitors `channel.bufferedAmount`. If it exceeds `HIGH_WATER` (8MB), the loop pauses and registers `channel.onbufferedamountlow` to resume sending when it drains below `LOW_WATER` (1MB).
5. **Completion:** A `DONE` message is sent once all chunks are fully pushed to the browser's transfer buffer.

### Receiving a File

The receiver handles incoming messages inside [setupReceiverChannel](client/src/core/webrtc.ts#L125) via the `onmessage` callback:

1. **Metadata Reception:** Receiving a JSON string with `type: "META"` extracts the file metadata and clears the local buffers.
2. **Chunk Reception:** Incoming binary data (handled as `ArrayBuffer` events) is parsed as a `Uint8Array`, stored in the `receivedBuffers` array, and progress is updated dynamically.
3. **Completion Reception:** Receiving a string message with `type: "DONE"` signals completion. The chunks in `receivedBuffers` are concatenated into a `Blob` which is wrapped in a standard `File` object and returned through `onFileReceived(file)`.
4. **Download:** The UI generates a download URL (`URL.createObjectURL()`) to let the user save the file to disk.

### Advanced Controls & Reliability

- **Prompt to Send:** A peer can send a `PROMPT_SEND` message over the DataChannel (or `relay-prompt-send` in relay mode) to trigger the other peer's file selection dialog, making bidirectional sharing smoother.
- **Relay Fallback Mode:** If the WebRTC connection fails to establish within 10 seconds (e.g., due to strict NATs) or disconnects unexpectedly, the system falls back to a cloud relay over the WebSocket connection. File chunks are converted to Base64 and sent directly through the signaling server (`relay-meta`, `relay-chunk`, `relay-done`), ensuring the transfer can complete even without a direct P2P connection.
