import { useEffect, useState } from "react";
import { useWS } from "../context/WebSocketContext";

export default function FileTransfer() {
  const { rtc, isCaller } = useWS();

  const [sendProgress, setSendProgress] = useState(0);
  const [receiveProgress, setReceiveProgress] = useState(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [channelReady, setChannelReady] = useState(false);

  useEffect(() => {
    if (!rtc) return;

    rtc.onConnected = () => {
      setChannelReady(true);
    };

    rtc.onSendProgress = setSendProgress;
    rtc.onReceiveProgress = setReceiveProgress;

    rtc.onFileReceived = (file) => {
      setReceivedFile(file);
    };

    rtc.onDisconnected = () => {
      setChannelReady(false);
      setSendProgress(0);
      setReceiveProgress(0);
      setReceivedFile(null);
      alert("❌ Peer disconnected");
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
    <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* ROLE HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">P2P File Transfer</h3>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isCaller
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {isCaller ? "🟦 Sender" : "🟩 Receiver"}
        </span>
      </div>

      {/* CONNECTION STATUS */}
      <div className="text-sm text-gray-600">
        {channelReady ? "🔗 Secure connection established" : "⏳ Connecting…"}
      </div>

      {/* SENDER PANEL */}
      {isCaller && (
        <div className="space-y-3">
          <label className="block font-medium text-gray-700">
            📤 Send a file
          </label>

          <input
            type="file"
            disabled={!channelReady}
            onChange={handleSendFile}
            className="block w-full text-sm border rounded p-2"
          />

          {sendProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Sending</span>
                <span>{sendProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${sendProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECEIVER PANEL */}
      {!isCaller && (
        <div className="space-y-3">
          <p className="text-gray-600">
            📥 Waiting to receive file from sender
          </p>
          {receiveProgress > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Receiving</span>
                <span>{receiveProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded h-2">
                <div
                  className="bg-green-500 h-2 rounded"
                  style={{ width: `${receiveProgress}%` }}
                />
              </div>
            </div>
          )}
          {/* STATUS & DOWNLOAD */}
          {!channelReady && (
            <p className="text-red-600 text-sm font-semibold">
              🔴 Disconnected
            </p>
          )}
          {receivedFile && (
            <div className="border rounded-lg p-4 bg-green-50 space-y-2">
              <p className="font-semibold text-green-700">✅ File received</p>

              <p className="text-sm">{receivedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(receivedFile.size / 1024).toFixed(2)} KB
              </p>

              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
              >
                ⬇ Download
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
