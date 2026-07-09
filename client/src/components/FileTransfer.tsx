import { useEffect, useState, useRef } from "react";
import { useWS } from "../context/WebSocketContext";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, CheckCircle, Loader2, Download, FileBox, Clock, X, Cloud } from "lucide-react";

interface FileTransferProps {
  peerName: string;
  disconnectPeer: () => void;
}

interface TransferHistory {
  name: string;
  size: number;
  type: "sent" | "received";
  file?: File;
}

export default function FileTransfer({ peerName, disconnectPeer }: FileTransferProps) {
  const { rtc } = useWS();
  const [isConnecting, setIsConnecting] = useState(true);
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [channelReady, setChannelReady] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [isRelayMode, setIsRelayMode] = useState(false);
  
  // History dialog state
  const [recentTransfer, setRecentTransfer] = useState<TransferHistory | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!rtc) return;
    
    // Reset state on new connection
    setIsConnecting(true);
    setConnectionError(false);
    setChannelReady(false);
    setSendProgress(0);
    setReceiveProgress(0);
    setRecentTransfer(null);
    setShowDialog(false);
    setIsRelayMode(false);
    
    // 10s timeout for WebRTC -> Switch to Relay Mode
    const timeout = setTimeout(() => {
      if (rtc && !rtc.isChannelOpen) {
        console.log("[FileTransfer] WebRTC Timeout. Switching to Relay Mode.");
        rtc.switchToRelayMode();
      }
    }, 10000);

    rtc.onConnected = () => {
      clearTimeout(timeout);
      setIsConnecting(false);
      setChannelReady(true);
      setConnectionError(false);
      if (rtc.relayMode) {
        setIsRelayMode(true);
      }
    };

    rtc.onConnectionFailed = () => {
      clearTimeout(timeout);
      setIsConnecting(false);
      setChannelReady(false);
      setConnectionError(true);
    };

    rtc.onSendProgress = setSendProgress;
    
    rtc.onReceiveProgress = (percent) => {
      setReceiveProgress(percent);
    };

    rtc.onFileReceived = (file) => {
      setReceiveProgress(100);
      setRecentTransfer({
        name: file.name,
        size: file.size,
        type: "received",
        file: file
      });
      setShowDialog(true);
    };
    
    rtc.onPromptSend = () => {
      // The peer requested us to send a file
      fileInputRef.current?.click();
    };

    rtc.onDisconnected = () => {
      setIsConnecting(false);
      setChannelReady(false);
      setSendProgress(0);
      setReceiveProgress(0);
    };

    return () => clearTimeout(timeout);
  }, [rtc]);

  function handleSendFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rtc || !channelReady) return;
    
    setSendProgress(0);
    
    // Send file and await completion
    rtc.sendFile(file).then(() => {
        setSendProgress(100);
        setRecentTransfer({
            name: file.name,
            size: file.size,
            type: "sent"
        });
        setShowDialog(true);
    }).catch(err => {
        console.error("Failed to send", err);
    });
  }

  function handlePromptSend() {
    if (rtc?.relayMode) {
      rtc.sendRelayMessage?.({ type: "relay-prompt-send" });
    } else if (rtc?.dataChannel?.readyState === "open") {
      rtc.dataChannel.send(JSON.stringify({ type: "PROMPT_SEND" }));
    }
  }

  function handleDownload() {
    if (!recentTransfer?.file) return;
    const url = URL.createObjectURL(recentTransfer.file);
    const a = document.createElement("a");
    a.href = url;
    a.download = recentTransfer.file.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function closeDialog() {
    setShowDialog(false);
    // Reset our local progress so the background UI returns to "idle"
    if (recentTransfer?.type === "sent") {
      setSendProgress(0);
    } else {
      setReceiveProgress(0);
    }
    // We intentionally DO NOT send a RESET signal to the peer. 
    // They manage their own UI state independently.
  }

  // Determine background state
  const isTransferring = (sendProgress > 0 && sendProgress < 100) || (receiveProgress > 0 && receiveProgress < 100);
  const isSender = sendProgress > 0;

  return (
    <div className="w-full relative font-sans h-56">
      {/* Relay Mode Badge */}
      {isRelayMode && (
        <div className="absolute top-4 left-4 px-2 py-1 bg-[#111] border border-accent/40 rounded shadow-md text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1.5 z-30">
          <Cloud size={14} className="text-accent" /> Cloud Relay Mode
        </div>
      )}

      {/* Base Layer: Connection Error */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 w-full bg-[#0f0f0f] rounded-2xl border border-[#222] p-8 text-center shadow-lg overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
          <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center mx-auto mb-4 border border-[#333]">
            <span className="text-red-500 text-xl font-bold">!</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Connection Timeout</h3>
          <p className="text-sm text-[#888] mb-6">Failed to establish a secure tunnel with {peerName}.</p>
          <button
            onClick={disconnectPeer}
            className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-lg text-sm font-semibold transition-colors border border-[#333]"
          >
            Go Back
          </button>
        </motion.div>
      )}

      {/* Base Layer: Connecting */}
      {isConnecting && !connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 w-full bg-[#0f0f0f] rounded-2xl border border-[#222] p-10 text-center shadow-lg overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 animate-pulse" />
          <Loader2 className="animate-spin text-accent mb-5 mx-auto" size={32} />
          <h3 className="text-lg font-bold text-white mb-1">Establishing Tunnel</h3>
          <p className="text-sm text-[#777] font-mono">Negotiating connection with {peerName}...</p>
          
          <div className="mt-8 flex justify-center">
            <div className="h-1 w-40 bg-[#1a1a1a] rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-accent rounded-full"
                 animate={{ x: ["-100%", "100%"] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 style={{ width: "40%" }}
               />
            </div>
          </div>
        </motion.div>
      )}

      {/* Base Layer: Ready (Half-Half Send & Receive) */}
      {channelReady && !isTransferring && !connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 w-full flex gap-4"
        >
          {/* Send Half */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#444] bg-[#0f0f0f] hover:bg-[#111] hover:border-accent transition-all cursor-pointer shadow-lg relative"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] mb-3 group-hover:border-accent/40 transition-colors"
            >
              <UploadCloud size={32} className="text-accent" />
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleSendFile}
            />
          </div>

          {/* Receive Half (Prompts sender) */}
          <div 
            onClick={handlePromptSend}
            className="group flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#444] bg-[#0f0f0f] hover:bg-[#111] hover:border-emerald-500 transition-all cursor-pointer shadow-lg relative"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] mb-3 group-hover:border-emerald-500/40 transition-colors"
            >
              <Download size={32} className="text-emerald-500" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Base Layer: Transferring */}
      {isTransferring && !connectionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 w-full flex flex-col justify-center rounded-2xl border border-[#222] bg-[#0f0f0f] p-8 text-center overflow-hidden shadow-lg"
        >
          {/* Animated data packets background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
                style={{
                  left: isSender ? "0%" : "100%",
                  animation: `flow 1.5s linear infinite`,
                  animationDelay: `${i * 0.4}s`,
                  animationDirection: isSender ? "normal" : "reverse",
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1">
              {isSender ? `Sending to ${peerName}...` : `Receiving from ${peerName}...`}
            </h3>
            <p className="text-xs text-[#777] mb-6">AES-256 Encrypted Tunnel</p>
            
            <div className="mb-2 flex justify-between text-xs font-mono font-semibold">
              <span className="text-[#888]">Progress</span>
              <span className="text-accent">{isSender ? sendProgress : receiveProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${isSender ? sendProgress : receiveProgress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Overlay Layer: The Complete Dialog */}
      <AnimatePresence>
        {showDialog && recentTransfer && !connectionError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-20 w-full flex flex-col justify-center rounded-2xl border border-accent/20 bg-[#0f0f0f]/95 backdrop-blur-md p-6 text-center shadow-2xl overflow-hidden"
          >
            {/* Clock icon in top left corner */}
            <div className="absolute top-4 left-4 text-[#555]">
              <Clock size={20} />
            </div>
            
            {/* Cross icon in top right to revert to split view */}
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 text-[#555] hover:text-white transition-colors cursor-pointer z-30"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center mx-auto mb-3 mt-2">
              <CheckCircle className="text-emerald-500" size={24} />
            </div>
            
            <h3 className="text-base font-bold text-white mb-4">
              {recentTransfer.type === "sent" ? "Sent Successfully" : "Received Successfully"}
            </h3>
            
            <div className="bg-[#0a0a0a] rounded-xl p-3 border border-[#222] flex items-center gap-3 w-full max-w-sm mx-auto mb-3">
              <FileBox size={20} className="text-[#666]" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">{recentTransfer.name}</p>
                <p className="text-xs text-[#666] font-mono mt-0.5">{(recentTransfer.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>

            {recentTransfer.type === "received" && (
              <div className="flex justify-center z-30 relative">
                <button
                  onClick={handleDownload}
                  className="w-full max-w-sm py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-[#e6e6e6] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Download size={16} /> Save File
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
