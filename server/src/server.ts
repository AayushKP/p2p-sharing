import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import type { User } from "./types.js";

const wss = new WebSocketServer({ port: 5000 });

let users: User[] = [];

function broadcastOnlineUsers() {
  const payload = JSON.stringify({
    type: "online-users",
    users: users.map((u) => ({ id: u.id })),
  });
  users.forEach((u) => u.ws.send(payload));
}

wss.on("connection", (ws) => {
  const newUser: User = { id: uuid(), ws };
  users.push(newUser);

  broadcastOnlineUsers();

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "request-connection") {
      const target = users.find((u) => u.id === data.to);
      if (target) {
        target.ws.send(
          JSON.stringify({
            type: "incoming-request",
            from: newUser.id,
          })
        );
      }
    }

    if (data.type === "accept-connection") {
      const roomId = uuid();

      const peerA = users.find((u) => u.id === newUser.id);
      const peerB = users.find((u) => u.id === data.to);

      peerA?.ws.send(JSON.stringify({ type: "webrtc-start", roomId }));
      peerB?.ws.send(JSON.stringify({ type: "webrtc-start", roomId }));
    }

    if (data.type === "offer") {
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
  });

  ws.on("close", () => {
    users = users.filter((u) => u.id !== newUser.id);
    broadcastOnlineUsers();
  });
});

console.log("WebSocket signaling server running on ws://localhost:5000");
