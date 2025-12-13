import { useEffect, useState } from "react";
import { useWS } from "../context/WebSocketContext";

export default function FileTransfer() {
  const { rtc } = useWS();

  const [sendProgress, setSendProgress] = useState<number>(0);
  const [receiveProgress, setReceiveProgress] = useState<number>(0);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [channelReady, setChannelReady] = useState<boolean>(false);

  // Attach WebRTC callbacks when rtc is available
  useEffect(() => {
    if (!rtc) {
      console.log("[UI] RTC not ready");
      return;
    }

    console.log("[UI] RTC ready, attaching callbacks");

    rtc.onConnected = () => {
      console.log("[UI] DataChannel OPEN");
      setChannelReady(true);
    };

    rtc.onSendProgress = (percent) => {
      console.log("[UI] Send progress:", percent);
      setSendProgress(percent);
    };

    rtc.onReceiveProgress = (percent) => {
      console.log("[UI] Receive progress:", percent);
      setReceiveProgress(percent);
    };

    rtc.onFileReceived = (file) => {
      console.log("[UI] File received in UI:", file);
      setReceivedFile(file);
    };
  }, [rtc]);

  function handleSendFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !rtc) return;

    if (!channelReady) {
      console.warn("[UI] DataChannel not ready yet");
      return;
    }

    console.log("[UI] Sending file:", file.name);
    setSendProgress(0);
    rtc.sendFile(file);
  }

  function handleDownload() {
    if (!receivedFile) return;

    console.log("[UI] Downloading file:", receivedFile.name);
    const url = URL.createObjectURL(receivedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = receivedFile.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="w-full max-w-md space-y-4 text-center">
      {/* SEND FILE */}
      <div className="space-y-2">
        <input
          type="file"
          disabled={!channelReady}
          onChange={handleSendFile}
          className="block w-full text-sm"
        />

        {!channelReady && (
          <p className="text-sm text-gray-500">Waiting for peer connection…</p>
        )}

        {sendProgress > 0 && (
          <p className="text-sm text-gray-700">Sending: {sendProgress}%</p>
        )}
      </div>

      {/* RECEIVE PROGRESS */}
      {receiveProgress > 0 && (
        <p className="text-sm text-gray-700">Receiving: {receiveProgress}%</p>
      )}

      {/* DOWNLOAD UI */}
      {receivedFile && (
        <div className="border rounded p-4 bg-gray-50 space-y-2">
          <p className="font-medium">File received</p>
          <p className="text-sm text-gray-600">{receivedFile.name}</p>
          <p className="text-xs text-gray-500">
            {(receivedFile.size / 1024).toFixed(2)} KB
          </p>

          <button
            onClick={handleDownload}
            className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
