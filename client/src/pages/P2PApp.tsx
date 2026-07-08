import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useWS, WSProvider } from "../context/WebSocketContext";
import FileTransfer from "../components/FileTransfer";
import { Share2, Copy, Check, Edit2, X, Users } from "lucide-react";

function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function P2PAppContent() {
  const {
    users,
    incomingRequest,
    incomingRequestName,
    connectedRoom,
    isCaller,
    targetUser,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    disconnectPeer,
    myId,
    myName,
    setMyName,
  } = useWS();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameInput, setEditNameInput] = useState(myName);
  const [copied, setCopied] = useState(false);

  // Cache the connected peer's name so it doesn't revert to "Unknown"
  const [cachedPeerName, setCachedPeerName] = useState("");

  useEffect(() => {
    if (targetUser) {
      const u = users.find((user) => user.id === targetUser);
      if (u?.name) {
        setCachedPeerName(u.name);
      }
    }
  }, [targetUser, users]);

  // STRICTLY filter out ourselves by BOTH ID and Name to ensure we don't show up as a peer node
  const filteredPeers = users.filter((u) => u.id !== myId && u.name !== myName);
  
  // Deduplicate peers by name (if a user has multiple tabs open, only show one node for them)
  const activePeers = filteredPeers.filter(
    (u, index, self) => index === self.findIndex((t) => t.name === u.name)
  );

  // Compute stable radial positions for peers relative to the radar container (0-100%)
  const peerPositions = useMemo(() => {
    const pos: Record<string, { x: string; y: string }> = {};
    activePeers.forEach((u, i) => {
      const h = hashStr(u.id);
      const angle =
        (i / Math.max(activePeers.length, 1)) * 2 * Math.PI +
        ((h % 100) / 100) * 0.5;
      const radius = 15 + ((h >> 8) % 35); // 15% to 50% from center
      pos[u.id] = {
        x: `${50 + radius * Math.cos(angle)}%`,
        y: `${50 + radius * Math.sin(angle)}%`,
      };
    });
    return pos;
  }, [activePeers]);

  const connectedPeerName =
    cachedPeerName || incomingRequestName || "Connected Peer";

  return (
    <div className="relative h-screen w-full bg-[#0a0a0a] text-white overflow-hidden selection:bg-accent/20 font-sans">
      {/* ── BACKGROUND LAYER ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute top-0 left-1/2 w-[80vw] h-[80vw] bg-accent/[0.04] rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* ── SOLID HEADER UI ── */}
      <header className="absolute top-0 left-0 right-0 p-6 flex items-start justify-between z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <Link
            to="/"
            className="group flex items-center gap-2.5 rounded-xl bg-[#111] border border-[#222] px-4 py-2 hover:bg-[#1a1a1a] transition-colors shadow-sm"
          >
            <Share2
              className="text-accent group-hover:scale-110 transition-transform"
              size={16}
            />
            <span className="text-[14px] font-semibold tracking-tight text-white/90">
              Peerly
            </span>
          </Link>
        </div>

        <div className="pointer-events-auto bg-[#111] border border-[#222] rounded-xl p-2 flex items-center gap-3 shadow-sm">
          <div className="flex flex-col px-2">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[9px] uppercase tracking-widest text-emerald-500 font-bold">
                Online
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
            {!isEditingName ? (
              <div
                className="flex items-center gap-2 group cursor-pointer"
                onClick={() => setIsEditingName(true)}
              >
                <span className="text-sm font-semibold text-white group-hover:text-accent transition-colors">
                  {myName}
                </span>
                <Edit2
                  size={12}
                  className="text-[#555] group-hover:text-accent transition-colors"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-24 bg-[#0a0a0a] border border-[#333] rounded px-2 py-0.5 text-sm font-semibold text-white focus:outline-none focus:border-accent text-right"
                  autoFocus
                  onBlur={() => {
                    if (editNameInput.trim()) {
                      setMyName(editNameInput.trim());
                    }
                    setIsEditingName(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-white font-mono text-xs uppercase">
            {myName.substring(0, 2)}
          </div>
        </div>
      </header>

      {/* ── SOLID FOOTER UI ── */}
      <footer className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between z-40 pointer-events-none">
        <div
          className="pointer-events-auto bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 flex items-center gap-3 group hover:bg-[#1a1a1a] transition-colors cursor-pointer shadow-sm"
          onClick={() => {
            navigator.clipboard.writeText(myId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          <span className="text-[11px] text-[#888] font-mono group-hover:text-white transition-colors">
            {myId}
          </span>
          <button className="text-[#555] group-hover:text-white transition-colors">
            {copied ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {connectedRoom && (
          <div className="pointer-events-auto">
            <button
              onClick={disconnectPeer}
              className="bg-[#111] border border-[#222] rounded-xl px-4 py-2.5 text-sm text-[#888] hover:bg-[#1a1a1a] hover:text-red-400 hover:border-red-900/50 transition-all flex items-center gap-2 shadow-sm"
            >
              <X size={16} /> Disconnect
            </button>
          </div>
        )}
      </footer>

      {/* ── TRANSFER CANVAS (MAIN AREA) ── */}
      <main className="absolute inset-0 z-10 flex items-center justify-center">
        {/* 1. Radar State (Not Connected) */}
        {!connectedRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* The Radar Container (Perfect circle using aspect-square, perfectly centered) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[55vh] max-h-[600px] min-h-[350px] aspect-square">
              {/* Concentric Rings */}
              <div className="absolute inset-0 rounded-full border border-[#222]" />
              <div className="absolute inset-[12.5%] rounded-full border border-[#1a1a1a]" />
              <div className="absolute inset-[25%] rounded-full border border-[#222]" />
              <div className="absolute inset-[37.5%] rounded-full border border-[#1a1a1a]" />
              <div className="absolute inset-[50%] rounded-full border border-[#333]" />

              {/* Radar Sweep */}
              <div
                className="absolute inset-0 rounded-full mix-blend-screen opacity-60"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, rgba(79,140,255,0.2) 60deg, transparent 120deg)",
                  animation: "radar-sweep 4s linear infinite",
                }}
              />

              {/* Central Node (You) */}
              <motion.div
                layoutId="node-you"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
                  <div className="w-14 h-14 rounded-full border border-accent/50 bg-[#111] flex items-center justify-center relative z-10">
                    <div className="w-3 h-3 rounded-full bg-accent shadow-[0_0_15px_rgba(79,140,255,1)] animate-[dot-pulse_2s_ease-in-out_infinite]" />
                  </div>
                </div>
              </motion.div>

              {/* Peer Nodes - Positioned strictly inside the container */}
              {activePeers.map((u) => {
                const pos = peerPositions[u.id];
                if (!pos) return null;
                const isWaiting =
                  isCaller && !incomingRequest && targetUser === u.id;

                return (
                  <motion.div
                    key={u.id}
                    layoutId={`node-${u.id}`}
                    className="absolute z-10 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: pos.x, top: pos.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  >
                    <button
                      onClick={() => sendConnectionRequest(u.id)}
                      className="relative cursor-pointer"
                    >
                      <div className="absolute inset-0 -m-3 rounded-full bg-emerald-500/10 opacity-0 group-hover:opacity-100 group-hover:animate-[pulse-ring_1.5s_ease-in-out_infinite] transition-opacity" />
                      <div className="w-10 h-10 rounded-full border border-[#333] bg-[#111] flex items-center justify-center hover:border-emerald-500 transition-colors relative z-10">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                      </div>

                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-[#111] border border-[#333] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 shadow-lg">
                        <span className="text-xs font-semibold text-white block">
                          {u.name || "Peer"}
                        </span>
                        <span className="text-[10px] text-[#777] font-mono">
                          {u.id.substring(0, 8)}...
                        </span>
                      </div>
                    </button>
                    {isWaiting && (
                      <div className="absolute -bottom-7 bg-[#111] border border-accent/50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                        <span className="text-[10px] text-accent font-semibold animate-pulse">
                          Connecting
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Waiting Text */}
            <div className="absolute bottom-16 flex flex-col items-center">
              <span className="text-xs text-accent font-mono uppercase tracking-widest mb-1 font-bold">
                {activePeers.length}{" "}
                {activePeers.length === 1 ? "Peer" : "Peers"} Online
              </span>
              <p className="text-sm text-[#888]">
                {activePeers.length > 0
                  ? "Select a node to establish a secure connection."
                  : "Searching for peers on the network..."}
              </p>
            </div>
          </motion.div>
        )}

        {/* 2. Connected State (Centered UI) */}
        {connectedRoom && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center w-full px-6 z-20"
          >
            <div className="w-full max-w-[480px]">
              {/* Peer Header */}
              <div className="mb-6 flex flex-col items-center text-center">
                <motion.div
                  layoutId={targetUser ? `node-${targetUser}` : "node-peer"}
                  className="w-16 h-16 mb-4 rounded-full border-2 border-emerald-500 bg-[#111] flex items-center justify-center relative shadow-[0_0_30px_rgba(16,185,129,0.15)]"
                >
                  <div className="absolute inset-0 rounded-full border border-emerald-500/40 animate-[pulse-ring_3s_ease-in-out_infinite]" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]" />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {connectedPeerName}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#777] font-mono">
                    {targetUser?.substring(0, 8)}...
                  </span>
                </div>
              </div>

              {/* The Transfer Component */}
              <div className="relative z-30">
                <FileTransfer
                  peerName={connectedPeerName}
                  disconnectPeer={disconnectPeer}
                />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── INCOMING REQUEST MODAL ── */}
      <AnimatePresence>
        {incomingRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#0f0f0f] rounded-2xl border border-[#222] shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-8 text-center relative">
                <div className="w-16 h-16 bg-[#1a1a1a] border border-[#333] rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Users size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-white">
                  Incoming Request
                </h3>
                <p className="text-[#888] text-sm">
                  <span className="text-white font-semibold">
                    {incomingRequestName || "Someone"}
                  </span>{" "}
                  wants to establish a secure P2P tunnel with you.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <button
                    onClick={() => rejectRequest(incomingRequest)}
                    className="px-4 py-3 rounded-lg border border-[#333] hover:bg-[#1a1a1a] hover:text-white transition-colors text-sm font-semibold text-[#888]"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => acceptRequest(incomingRequest)}
                    className="px-4 py-3 rounded-lg bg-white text-black hover:bg-[#e6e6e6] transition-colors text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                  >
                    Accept Tunnel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function P2PApp() {
  const [name, setName] = useState<string | null>(() => {
    return localStorage.getItem("peerly-username");
  });
  const [nameInput, setNameInput] = useState("");

  if (!name) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-[#0f0f0f] rounded-2xl border border-[#222] shadow-2xl w-full max-w-sm p-8 text-center relative z-10"
        >
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#333] rounded-xl flex items-center justify-center mx-auto mb-6">
            <Share2 size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-white">
            Welcome to Peerly
          </h1>
          <p className="text-[#888] text-sm mb-8">
            Enter your name to join the secure peer-to-peer network.
          </p>

          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#333] rounded-lg text-base text-center text-white placeholder-[#555] focus:outline-none focus:border-accent transition-colors mb-4"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && nameInput.trim()) {
                localStorage.setItem("peerly-username", nameInput.trim());
                setName(nameInput.trim());
              }
            }}
          />

          <button
            onClick={() => {
              if (nameInput.trim()) {
                localStorage.setItem("peerly-username", nameInput.trim());
                setName(nameInput.trim());
              }
            }}
            disabled={!nameInput.trim()}
            className="w-full px-4 py-3 bg-white hover:bg-[#e6e6e6] disabled:bg-[#222] disabled:text-[#555] text-black rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:shadow-none"
          >
            Launch Peerly
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <WSProvider name={name}>
      <P2PAppContent />
    </WSProvider>
  );
}
