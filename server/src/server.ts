import { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import type { User } from "./types.js";
import dotenv from "dotenv";

dotenv.config();
const wss = new WebSocketServer({ port: Number(process.env["PORT"]) || 5000 });

let users: User[] = [];

function broadcastOnlineUsers() {
  users.forEach((user) => {
    const filtered = users
      .filter((u) => u.id !== user.id)
      .map((u) => ({ id: u.id }));

    user.ws.send(
      JSON.stringify({
        type: "online-users",
        users: filtered,
      })
    );
  });
}

wss.on("connection", (ws) => {
  const newUser: User = { id: uuid(), ws };
  users.push(newUser);
  console.log("New connection:", newUser.id);
  newUser.ws.send(
    JSON.stringify({
      type: "your-id",
      id: newUser.id,
    })
  );
  console.log("Assigned ID:", newUser.id);

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

      const requester = users.find((u) => u.id === data.from);
      const receiver = newUser; // B is newUser

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

console.log("WebSocket signaling server running");
