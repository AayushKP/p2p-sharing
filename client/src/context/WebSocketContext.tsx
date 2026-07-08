import { createContext, useContext, useEffect, useRef, useState } from "react";
import { WSClient } from "../core/ws";
import { WebRTCManager } from "../core/webrtc";

interface User {
  id: string;
  name?: string;
}

interface WSContextType {
  myId: string;
  myName: string;
  users: User[];
  incomingRequest: string | null;
  incomingRequestName: string | null;
  connectedRoom: string | null;
  isCaller: boolean;
  rtc: WebRTCManager | null;
  targetUser: string | null;
  sendConnectionRequest: (to: string) => void;
  acceptRequest: (from: string) => void;
  rejectRequest: (from: string) => void;
  cancelConnectionRequest: () => void;
  disconnectPeer: () => void;
  setMyName: (name: string) => void;
}

const WSContext = createContext<WSContextType>({
  myId: "",
  myName: "",
  users: [],
  incomingRequest: null,
  incomingRequestName: null,
  connectedRoom: null,
  isCaller: false,
  rtc: null,
  targetUser: null,
  sendConnectionRequest: () => {},
  acceptRequest: () => {},
  rejectRequest: () => {},
  cancelConnectionRequest: () => {},
  disconnectPeer: () => {},
  setMyName: () => {},
});

export const useWS = () => useContext(WSContext);

export function WSProvider({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  const [ws] = useState(() => new WSClient(name));
  const [myId, setMyId] = useState<string>("");
  const [myName, setMyNameState] = useState<string>(name);
  const [users, setUsers] = useState<User[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<string | null>(null);
  const [incomingRequestName, setIncomingRequestName] = useState<string | null>(
    null,
  );
  const [connectedRoom, setConnectedRoom] = useState<string | null>(null);

  const [isCaller, setIsCaller] = useState<boolean>(false);
  const [targetUser, setTargetUser] = useState<string | null>(null);

  const [rtc, setRtc] = useState<WebRTCManager | null>(null);
  const rtcRef = useRef<WebRTCManager | null>(null);

  // Function to update name (for edits)
  function setMyName(newName: string) {
    setMyNameState(newName);
    localStorage.setItem("peerly-username", newName);
    if (ws.ws.readyState === WebSocket.OPEN) {
      ws.send("register-name", { name: newName });
    }
  }

  // handle user disconnects
  useEffect(() => {
    if (!targetUser || !connectedRoom) return;

    const stillOnline = users.some((u) => u.id === targetUser);
    if (!stillOnline) {
      rtcRef.current?.peer.close();
      rtcRef.current = null;
      setRtc(null);
      setConnectedRoom(null);
    }
  }, [users, targetUser, connectedRoom]);

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

      // incoming connection request(from another user)
      if (data.type === "incoming-request") {
        setIncomingRequest(data.from);
        setIncomingRequestName(data.fromName || null);
        return;
      }

      // peer disconnected or connection ended
      if (
        data.type === "peer-disconnect" ||
        data.type === "connection-timeout"
      ) {
        rtcRef.current?.peer.close();
        rtcRef.current = null;
        setRtc(null);
        setConnectedRoom(null);
        setIncomingRequest(null);
        setIsCaller(false);
        setTargetUser(null);
        return;
      }

      // sender cancelled the connection request
      if (data.type === "cancel-connection") {
        alert("Connection request was cancelled by the sender.");
        setIncomingRequest(null);
        setTargetUser(null);
        return;
      }

      // webrtc start - both sides
      if (data.type === "webrtc-start") {
        setConnectedRoom(data.roomId);
        setTargetUser(data.otherUser);
        setIsCaller(data.isCaller);

        const connection = new WebRTCManager();
        rtcRef.current = connection;
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

      // connection request rejected by receiver
      if (data.type === "connection-rejected") {
        alert("Connection request rejected");
        setIsCaller(false);
        setConnectedRoom(null);
        setTargetUser(null);
        rtcRef.current = null;
        setRtc(null);
        return;
      }

      // receiver sends in response to caller
      if (data.type === "offer" && rtcRef.current) {
        await rtcRef.current.setRemoteDescription(data.sdp);
        const answer = await rtcRef.current.createAnswer();
        ws.send("answer", {
          to: data.from,
          sdp: answer,
        });
        return;
      }

      // caller sends in response to receiver
      if (data.type === "answer" && rtcRef.current) {
        await rtcRef.current.setRemoteDescription(data.sdp);
        return;
      }

      //ice-candidate(both sides)
      if (data.type === "ice-candidate" && rtcRef.current) {
        await rtcRef.current.addIceCandidate(data.candidate);
        return;
      }
    };
  }, [ws]);

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

  function rejectRequest(from: string) {
    ws.send("reject-connection", { to: from });
    setIncomingRequest(null);
  }

  function cancelConnectionRequest() {
    if (targetUser) {
      ws.send("cancel-connection", { to: targetUser });
    }
    setIsCaller(false);
    setTargetUser(null);
  }

  function disconnectPeer() {
    if (targetUser) {
      ws.send("peer-disconnect", { to: targetUser });
    }
    rtc?.peer.close();
    setRtc(null);
    setConnectedRoom(null);
    setIsCaller(false);
    setTargetUser(null);
    setIncomingRequest(null);
  }

  return (
    <WSContext.Provider
      value={{
        myId,
        myName,
        users,
        incomingRequest,
        incomingRequestName,
        connectedRoom,
        isCaller,
        rtc,
        targetUser,
        sendConnectionRequest,
        acceptRequest,
        rejectRequest,
        cancelConnectionRequest,
        disconnectPeer,
        setMyName,
      }}
    >
      {children}
    </WSContext.Provider>
  );
}
