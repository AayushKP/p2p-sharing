import { createContext, useContext, useEffect, useState } from "react";
import { WSClient } from "../core/ws";

interface User {
  id: string;
}

interface WSContextType {
  users: User[];
  incomingRequest: string | null;
  connectedRoom: string | null;
  isCaller: boolean;
  sendConnectionRequest: (to: string) => void;
  acceptRequest: (from: string) => void;
  myId?: string;
}

const WSContext = createContext<WSContextType>({
  users: [],
  incomingRequest: null,
  connectedRoom: null,
  isCaller: false,
  sendConnectionRequest: () => {},
  acceptRequest: () => {},
  myId: "",
});

export const useWS = () => useContext(WSContext);

export function WSProvider({ children }: { children: React.ReactNode }) {
  const [ws] = useState(() => new WSClient());
  const [myId, setMyId] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<string | null>(null);
  const [connectedRoom, setConnectedRoom] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<string | null>(null);

  useEffect(() => {
    ws.ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      console.log("WS MESSAGE:", data);

      if (data.type === "your-id") {
        setMyId(data.id);
      }

      // Update user list
      if (data.type === "online-users") {
        setUsers(data.users);
      }

      // Only the target user receives this
      if (data.type === "incoming-request") {
        setIncomingRequest(data.from);
      }

      // Both get this after accept
      if (data.type === "webrtc-start") {
        setConnectedRoom(data.roomId);
        setTargetUser(data.otherUser);
        setIsCaller(data.isCaller);
      }
    };
  }, [ws]);

  // A clicks B → send request
  function sendConnectionRequest(to: string) {
    setIsCaller(true);
    setTargetUser(to);
    ws.send("request-connection", { to });
  }

  // B accepts A’s request
  function acceptRequest(from: string) {
    setIsCaller(false);
    setTargetUser(from);
    ws.send("accept-connection", { from });
    setIncomingRequest(null);
  }

  return (
    <WSContext.Provider
      value={{
        users,
        incomingRequest,
        connectedRoom,
        isCaller,
        sendConnectionRequest,
        acceptRequest,
        myId,
      }}
    >
      {children}
    </WSContext.Provider>
  );
}
