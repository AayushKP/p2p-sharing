import { useEffect, useState } from "react";
import { useWS } from "../context/WebSocketContext";
import {
  Upload,
  Download,
  FileText,
  CheckCircle,
  Loader2,
  Share2,
} from "lucide-react";

export default function FileTransfer() {
  const { rtc, isCaller } = useWS();
  const [isConnecting, setIsConnecting] = useState(true);
  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [channelReady, setChannelReady] = useState(false);

  useEffect(() => {
    if (!rtc) return;
    setIsConnecting(true);
    rtc.onConnected = () => {
      setIsConnecting(false);
      setChannelReady(true);
    };

    rtc.onConnectionFailed = () => {
      setIsConnecting(false);
      setChannelReady(false);
      alert("Unable to establish connection");
    };

    rtc.onSendProgress = setSendProgress;
    rtc.onReceiveProgress = setReceiveProgress;

    rtc.onFileReceived = (file) => setReceivedFile(file);

    rtc.onDisconnected = () => {
      setIsConnecting(false);
      setChannelReady(false);
      setSendProgress(0);
      setReceiveProgress(0);
      setReceivedFile(null);
      alert("Peer disconnected");
    };
  }, [rtc]);

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

  return (
    <div className="w-full max-w-md md:max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-8 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-800 rounded-lg border border-gray-700">
            <Share2 className="text-gray-300" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">File Transfer</h3>
            <p className="text-xs text-gray-500">Secure P2P Channel</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            isCaller
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : "bg-green-500/10 text-green-400 border-green-500/20"
          }`}
        >
          {isCaller ? (
            <>
              <Upload size={12} /> Sender
            </>
          ) : (
            <>
              <Download size={12} /> Receiver
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-950/50 p-3 rounded-lg border border-gray-800">
        {channelReady ? (
          <>
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-300">Channel secure & ready</span>
          </>
        ) : isConnecting ? (
          <>
            <Loader2 size={14} className="animate-spin text-yellow-500" />
            <span>Establishing connection...</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span>Not connected</span>
          </>
        )}
      </div>

      {isCaller && (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block font-medium text-gray-300 text-sm">
              Select file to send
            </label>

            <div className="relative group">
              <input
                type="file"
                disabled={!channelReady}
                onChange={handleSendFile}
                className="block w-full text-sm text-gray-400
                   file:mr-4 file:py-2.5 file:px-4
                   file:rounded-lg file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-600 file:text-white
                   hover:file:bg-blue-500
                   file:cursor-pointer file:transition-colors
                   cursor-pointer
                   bg-gray-800/50 rounded-lg border border-gray-700
                 "
              />
            </div>
          </div>

          {sendProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-400">
                <span>Sending...</span>
                <span>{sendProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!isCaller && (
        <div className="space-y-6">
          {!receivedFile && !receiveProgress && (
            <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/50">
              <Loader2
                size={32}
                className="mx-auto text-gray-600 animate-spin mb-3"
              />
              <p className="text-gray-400 text-sm">
                Waiting for sender to start...
              </p>
            </div>
          )}

          {receiveProgress > 0 && receiveProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-400">
                <span>Receiving...</span>
                <span>{receiveProgress}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-600 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${receiveProgress}%` }}
                />
              </div>
            </div>
          )}

          {receivedFile && (
            <div className="border border-green-500/30 rounded-xl p-5 bg-green-500/5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="text-green-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-green-400 text-sm">
                    File Received Successfully
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <FileText
                      size={14}
                      className="text-gray-400 flex-shrink-0"
                    />
                    <p className="text-sm text-gray-300 truncate">
                      {receivedFile.name}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    {(receivedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white py-2.5 rounded-lg transition-all shadow-lg shadow-green-900/20 font-medium text-sm"
              >
                <Download size={16} /> Download File
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
