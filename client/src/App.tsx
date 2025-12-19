import FileTransfer from "./components/FileTransfer";
import { useWS } from "./context/WebSocketContext";

export default function App() {
  const {
    users,
    incomingRequest,
    connectedRoom,
    isCaller,
    sendConnectionRequest,
    acceptRequest,
    rejectRequest,
    myId,
  } = useWS();

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100 text-gray-800">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-72 bg-white border-b md:border-b-0 md:border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">P2P Share</h1>
          <p className="text-sm text-gray-500">WebRTC File Transfer</p>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="mb-4 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium">
            👤 You
            <div className="text-xs text-gray-600 break-all">{myId}</div>
          </div>

          <h2 className="text-sm font-semibold text-gray-500 mb-2">
            Online Users
          </h2>

          <div className="space-y-2">
            {users.length === 0 && (
              <p className="text-sm text-gray-400">No users online</p>
            )}

            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => sendConnectionRequest(u.id)}
                className="w-full text-left px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition text-sm break-all"
              >
                {u.id}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto flex items-center justify-center">
        {!connectedRoom && (
          <div className="w-full flex flex-col items-center justify-center text-center space-y-3">
            {!incomingRequest && !isCaller && (
              <>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Not Connected
                </h2>
                <p className="text-gray-500 max-w-md text-sm md:text-base">
                  Select a user from the list to start a secure peer-to-peer
                  file transfer.
                </p>
              </>
            )}

            {isCaller && !incomingRequest && (
              <>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Waiting for acceptance
                </h2>
                <p className="text-gray-500 text-sm">
                  Connection request sent.
                </p>
              </>
            )}
          </div>
        )}

        {connectedRoom && (
          <div className="w-full flex flex-col items-center space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-600">Connected</h2>
              <p className="text-sm text-gray-500">
                Role:{" "}
                <span
                  className={`font-semibold ${
                    isCaller ? "text-blue-600" : "text-green-600"
                  }`}
                >
                  {isCaller ? "Sender" : "Receiver"}
                </span>
              </p>
            </div>

            <FileTransfer />
          </div>
        )}
      </main>

      {/* Incoming Request Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold">Incoming Connection</h3>

            <p className="text-gray-600 break-all text-sm">
              <span className="font-medium">{incomingRequest}</span> wants to
              connect with you.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => acceptRequest(incomingRequest)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Accept
              </button>

              <button
                onClick={() => rejectRequest(incomingRequest)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
