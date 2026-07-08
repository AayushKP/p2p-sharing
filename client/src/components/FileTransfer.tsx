import { useEffect, useState, useRef } from "react";
import { useWS } from "../context/WebSocketContext";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle, Loader2, Download, FileBox } from "lucide-react";

interface FileTransferProps {
  peerName: string;
  disconnectPeer: () => void;
}

export default function FileTransfer({ peerName, disconnectPeer }: FileTransferProps) {
  const { rtc, isCaller } = useWS();
  const [isConnecting, setIsConnecting] = useState(true);
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [channelReady, setChannelReady] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!rtc) return;
    
    // Reset state on new connection
    setIsConnecting(true);
    setConnectionError(false);
    setChannelReady(false);
    setSendProgress(0);
    setReceiveProgress(0);
    setReceivedFile(null);
    
    // 30s timeout for connection
    const timeout = setTimeout(() => {
      setIsConnecting(false);
      setConnectionError(true);
      setChannelReady(false);
    }, 30000);

    rtc.onConnected = () => {
      clearTimeout(timeout);
      setIsConnecting(false);
      setChannelReady(true);
      setConnectionError(false);
    };

    rtc.onConnectionFailed = () => {
      clearTimeout(timeout);
      setIsConnecting(false);
      setChannelReady(false);
      setConnectionError(true);
    };

    rtc.onSendProgress = setSendProgress;
    rtc.onReceiveProgress = setReceiveProgress;

    rtc.onFileReceived = (file) => {
      setReceivedFile(file);
      setReceiveProgress(100);
    };

    rtc.onReset = () => {
      setSendProgress(0);
      setReceiveProgress(0);
      setReceivedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    rtc.onDisconnected = () => {
      setIsConnecting(false);
      setChannelReady(false);
      setSendProgress(0);
      setReceiveProgress(0);
      setReceivedFile(null);
    };

    return () => clearTimeout(timeout);
  }, [rtc]); // Only depend on rtc, NOT channelReady

  function handleSendFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rtc || !channelReady || !isCaller) return;
    setSendProgress(0);
    rtc.sendFile(file);
  }

  function handleDownload() {
    if (!receivedFile) return;
    const url = URL.createObjectURL(receivedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = receivedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetTransfer() {
    setSendProgress(0);
    setReceiveProgress(0);
    setReceivedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    
    // Notify peer to reset their UI as well
    if (rtc?.dataChannel?.readyState === "open") {
      rtc.dataChannel.send(JSON.stringify({ type: "RESET" }));
    }
  }

  // Determine state
  const isTransferring = (sendProgress > 0 && sendProgress < 100) || (receiveProgress > 0 && receiveProgress < 100);
  const isComplete = sendProgress === 100 || receiveProgress === 100;

  return (
    <div className="w-full relative font-sans">
      {/* State: Connection Error */}
      {connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0f0f0f] rounded-2xl border border-[#222] p-8 text-center shadow-lg relative overflow-hidden"
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

      {/* State: Connecting */}
      {isConnecting && !connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#0f0f0f] rounded-2xl border border-[#222] p-10 text-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/0 via-accent to-accent/0 animate-pulse" />
          <Loader2 className="animate-spin text-accent mb-5 mx-auto" size={32} />
          <h3 className="text-lg font-bold text-white mb-1">Establishing Tunnel</h3>
          <p className="text-sm text-[#777] font-mono">Negotiating DTLS 1.2 with {peerName}...</p>
          
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

      {/* State: Ready to Send / Waiting to Receive */}
      {channelReady && !isTransferring && !isComplete && !connectionError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {isCaller ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center w-full h-56 rounded-2xl border border-dashed border-[#444] bg-[#0f0f0f] hover:bg-[#111] hover:border-accent transition-all cursor-pointer shadow-lg"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] mb-4 group-hover:border-accent/40 transition-colors"
              >
                <UploadCloud size={28} className="text-accent" />
              </motion.div>
              <p className="text-base font-bold text-white mb-1">Click or drag file to send</p>
              <p className="text-xs text-[#777]">Secure E2E transfer to {peerName}</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleSendFile}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-56 rounded-2xl border border-dashed border-[#444] bg-[#0f0f0f] shadow-lg relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="p-4 rounded-xl bg-[#1a1a1a] border border-[#333] mb-4"
              >
                <Download size={28} className="text-emerald-500" />
              </motion.div>
              <p className="text-base font-bold text-white mb-1">Ready to receive</p>
              <p className="text-xs text-[#777]">Waiting for {peerName} to send a file...</p>
            </div>
          )}
        </motion.div>
      )}

      {/* State: Transferring */}
      {isTransferring && !connectionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-2xl border border-[#222] bg-[#0f0f0f] p-8 text-center relative overflow-hidden shadow-lg"
        >
          {/* Animated data packets background (solid styling) */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute top-1/2 -translate-y-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
                style={{
                  left: isCaller ? "0%" : "100%",
                  animation: `flow 1.5s linear infinite`,
                  animationDelay: `${i * 0.4}s`,
                  animationDirection: isCaller ? "normal" : "reverse",
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold text-white mb-1">
              {isCaller ? `Sending to ${peerName}...` : `Receiving from ${peerName}...`}
            </h3>
            <p className="text-xs text-[#777] mb-6">AES-256 Encrypted Tunnel</p>
            
            <div className="mb-2 flex justify-between text-xs font-mono font-semibold">
              <span className="text-[#888]">Progress</span>
              <span className="text-accent">{isCaller ? sendProgress : receiveProgress}%</span>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${isCaller ? sendProgress : receiveProgress}%` }}
                transition={{ ease: "linear", duration: 0.2 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* State: Complete */}
      {isComplete && !connectionError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full rounded-2xl border border-[#222] bg-[#0f0f0f] p-8 text-center shadow-lg relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Transfer Complete</h3>
          
          {receivedFile ? (
            <div className="mt-6 text-left">
              <div className="bg-[#0a0a0a] rounded-xl p-4 border border-[#222] flex items-center gap-4 mb-5">
                <FileBox size={24} className="text-[#666]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{receivedFile.name}</p>
                  <p className="text-xs text-[#666] font-mono mt-0.5">{(receivedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-[#e6e6e6] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <Download size={16} /> Save File
                </button>
                <button
                  onClick={resetTransfer}
                  className="w-full py-3 rounded-lg bg-transparent border border-[#333] text-white font-bold text-sm hover:bg-[#1a1a1a] transition-all flex items-center justify-center gap-2"
                >
                  Receive Another File
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-[#777] mb-6">File successfully delivered to {peerName}.</p>
              <button
                onClick={resetTransfer}
                className="w-full py-3 rounded-lg bg-white text-black font-bold text-sm hover:bg-[#e6e6e6] transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                <UploadCloud size={16} /> Send Another File
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
