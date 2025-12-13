import { createContext, useContext, useEffect, useState } from "react";
import { WSClient } from "../core/ws";
import { WebRTCManager } from "../core/webrtc";

interface User {
  id: string;
}

interface WSContextType {
  myId: string;
  users: User[];
  incomingRequest: string | null;
  connectedRoom: string | null;
  isCaller: boolean;
  rtc: WebRTCManager | null;
  sendConnectionRequest: (to: string) => void;
  acceptRequest: (from: string) => void;
}

const WSContext = createContext<WSContextType>({
  myId: "",
  users: [],
  incomingRequest: null,
  connectedRoom: null,
  isCaller: false,
  rtc: null,
  sendConnectionRequest: () => {},
  acceptRequest: () => {},
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

  const [rtc, setRtc] = useState<WebRTCManager | null>(null);

  useEffect(() => {
    ws.ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      // my assigned id from server
      if (data.type === "your-id") {
        setMyId(data.id);
        return;
      }

      //online users list update
      if (data.type === "online-users") {
        setUsers(data.users);
        return;
      }

      // icoming connection request(from another user)
      if (data.type === "incoming-request") {
        setIncomingRequest(data.from);
        return;
      }

      // webrtc start - both sides
      if (data.type === "webrtc-start") {
        setConnectedRoom(data.roomId);
        setTargetUser(data.otherUser);
        setIsCaller(data.isCaller);

        const connection = new WebRTCManager();
        setRtc(connection);

        connection.onIceCandidate = (candidate) => {
          ws.send("ice-candidate", {
            to: data.otherUser,
            candidate,
          });
        };

        //offer created by caller
        if (data.isCaller) {
          const offer = await connection.createOffer();
          ws.send("offer", {
            to: data.otherUser,
            sdp: offer,
          });
        }

        return;
      }

      // receiver sends in response to caller
      if (data.type === "offer" && rtc) {
        await rtc.setRemoteDescription(data.sdp);
        const answer = await rtc.createAnswer();
        ws.send("answer", {
          to: data.from,
          sdp: answer,
        });
        return;
      }

      // caller sends in response to receiver)
      if (data.type === "answer" && rtc) {
        await rtc.setRemoteDescription(data.sdp);
        return;
      }

      //ice-candidate(both sides)
      if (data.type === "ice-candidate" && rtc) {
        await rtc.addIceCandidate(data.candidate);
        return;
      }
    };
  }, [ws, rtc]);

  // user-actions
  function sendConnectionRequest(to: string) {
    setIsCaller(true);
    setTargetUser(to);
    ws.send("request-connection", { to });
  }

  function acceptRequest(from: string) {
    setIsCaller(false);
    setTargetUser(from);
    ws.send("accept-connection", { from });
    setIncomingRequest(null);
  }

  return (
    <WSContext.Provider
      value={{
        myId,
        users,
        incomingRequest,
        connectedRoom,
        isCaller,
        rtc,
        sendConnectionRequest,
        acceptRequest,
      }}
    >
      {children}
    </WSContext.Provider>
  );
}
