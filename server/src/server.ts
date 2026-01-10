import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import type { UserWithDeviceDetails } from "./types.js";
import dotenv from "dotenv";
import http from "http";

dotenv.config();

const PORT = Number(process.env["PORT"] ?? 5000);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

let users: UserWithDeviceDetails[] = [];

function broadcastOnlineUsers() {
  users.forEach((user) => {
    const filtered = users
      .filter((u) => u.id !== user.id)
      .map((u) => ({
        id: u.id,
        name: u.name,
        deviceName: u.deviceInfo?.deviceName,
        deviceModel: u.deviceInfo?.deviceModel,
        manufacturer: u.deviceInfo?.manufacturer,
      }));

    user.ws.send(
      JSON.stringify({
        type: "online-users",
        users: filtered,
      })
    );
  });
}

wss.on("connection", (ws, req) => {
  // Parse name from URL query params
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const nameParam = url.searchParams.get("name");

  const newUser: UserWithDeviceDetails = { id: uuid(), ws };
  if (nameParam) newUser.name = nameParam;
  users.push(newUser);
  console.log("New connection:", newUser.id, "name:", nameParam);

  newUser.ws.send(
    JSON.stringify({
      type: "your-id",
      id: newUser.id,
      name: newUser.name,
    })
  );

  broadcastOnlineUsers();

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    //for mobile device registration
    if (data.type === "register-device") {
      const user = users.find((u) => u.id === newUser.id);
      if (user && data.deviceInfo) {
        user.deviceInfo = data.deviceInfo;
        console.log(`Device registered for ${user.id}:`, data.deviceInfo);
        broadcastOnlineUsers();
      }
    }

    // Update name (for name changes)
    if (data.type === "register-name") {
      const user = users.find((u) => u.id === newUser.id);
      if (user && data.name) {
        user.name = data.name;
        console.log(`Name updated for ${user.id}:`, data.name);
        broadcastOnlineUsers();
      }
    }

    if (data.type === "request-connection") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        console.log(
          `Forwarding connection request from ${newUser.id} to ${target.id}`
        );
        target.ws.send(
          JSON.stringify({
            type: "incoming-request",
            from: newUser.id,
            fromName: newUser.name,
            deviceInfo: newUser.deviceInfo,
          })
        );
      } else {
        console.warn(`Target user ${data.to} not found for connection request`);
      }
    }

    if (data.type === "accept-connection") {
      const roomId = uuid();

      const requester = users.find((u) => u.id === data.from);
      const receiver = newUser; // B is newUser

      console.log(
        `Starting WebRTC between ${requester?.id} and ${receiver.id}`
      );
      requester?.ws.send(
        JSON.stringify({
          type: "webrtc-start",
          roomId,
          otherUser: receiver.id,
          isCaller: true, // A is caller
        })
      );

      receiver.ws.send(
        JSON.stringify({
          type: "webrtc-start",
          roomId,
          otherUser: requester!.id,
          isCaller: false, // B is receiver
        })
      );
    }

    if (data.type === "offer") {
      console.log(`Forwarding offer from ${newUser.id} to ${data.to}`);
      const target = users.find((u) => u.id === data.to);
      target?.ws.send(
        JSON.stringify({
          type: "offer",
          from: newUser.id,
          sdp: data.sdp,
        })
      );
    }

    if (data.type === "answer") {
      console.log(`Forwarding answer from ${newUser.id} to ${data.to}`);
      const target = users.find((u) => u.id === data.to);
      target?.ws.send(
        JSON.stringify({
          type: "answer",
          from: newUser.id,
          sdp: data.sdp,
        })
      );
    }

    if (data.type === "ice-candidate") {
      const target = users.find((u) => u.id === data.to);
      target?.ws.send(
        JSON.stringify({
          type: "ice-candidate",
          from: newUser.id,
          candidate: data.candidate,
        })
      );
    }

    if (data.type === "peer-disconnect") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        target.ws.send(
          JSON.stringify({
            type: "peer-disconnect",
            from: newUser.id,
          })
        );
      }
    }

    if (data.type === "connection-timeout") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        target.ws.send(
          JSON.stringify({
            type: "connection-timeout",
            from: newUser.id,
          })
        );
      }
    }

    if (data.type === "cancel-connection") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        target.ws.send(
          JSON.stringify({
            type: "cancel-connection",
            from: newUser.id,
          })
        );
      }
    }

    if (data.type === "reject-connection") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        target.ws.send(
          JSON.stringify({
            type: "connection-rejected",
            from: newUser.id,
          })
        );
      }
    }
  });

  ws.on("close", () => {
    users = users.filter((u) => u.id !== newUser.id);
    broadcastOnlineUsers();
  });
});

console.log(
  "WebSocket signaling server running on port " + (process.env["PORT"] || 5000)
);

server.listen(PORT, () => {
  console.log("HTTP + WebSocket server running on port " + PORT);
});
