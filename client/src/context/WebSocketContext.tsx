import { createContext, useContext, useEffect, useState } from "react";
import { WSClient } from "../core/ws";

interface User {
  id: string;
}

interface WSContextType {
  ws: WSClient | null;
  users: User[];
  incomingRequest: string | null;
  connectedRoom: string | null;
  sendConnectionRequest: (to: string) => void;
  acceptRequest: (from: string) => void;
}

const WSContext = createContext<WSContextType>({
  ws: null,
  users: [],
  incomingRequest: null,
  connectedRoom: null,
  sendConnectionRequest: () => {},
  acceptRequest: () => {},
});

export const useWS = () => useContext(WSContext);

export function WSProvider({ children }: { children: React.ReactNode }) {
  const [ws] = useState(() => new WSClient());
  const [users, setUsers] = useState<User[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<string | null>(null);
  const [connectedRoom, setConnectedRoom] = useState<string | null>(null);

  useEffect(() => {
    if (!ws.ws) return;

    ws.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);

      if (data.type === "online-users") {
        setUsers(data.users);
      }

      if (data.type === "incoming-request") {
        setIncomingRequest(data.from);
      }

      if (data.type === "webrtc-start") {
        setConnectedRoom(data.roomId);
      }
    };
  }, [ws]);

  function sendConnectionRequest(to: string) {
    ws.send("request-connection", { to });
  }

  function acceptRequest(from: string) {
    ws.send("accept-connection", { to: from, accepted: true });
    setIncomingRequest(null);
  }

  return (
    <WSContext.Provider
      value={{
        ws,
        users,
        incomingRequest,
        connectedRoom,
        sendConnectionRequest,
        acceptRequest,
      }}
    >
      {children}
    </WSContext.Provider>
  );
}
