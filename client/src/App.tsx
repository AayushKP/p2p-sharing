import { useWS } from "./context/WebSocketContext";

export default function App() {
  const {
    users,
    incomingRequest,
    connectedRoom,
    isCaller,
    sendConnectionRequest,
    acceptRequest,
    myId,
  } = useWS();

  return (
    <div className="h-screen flex bg-gray-100">
      <aside className="w-64 min-w-50 bg-white border-r p-4 overflow-y-auto">
        <h1 className="text-xl font-bold mb-4">Users Online</h1>

        <div className="p-2 mb-4 bg-gray-200 rounded text-gray-900 font-semibold">
          You: {myId}
        </div>

        <div className="space-y-3">
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => sendConnectionRequest(u.id)}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
            >
              {u.id}
            </button>
          ))}
        </div>
      </aside>
      <main className="flex-1 flex items-center justify-center text-center p-6">
        {!connectedRoom && (
          <div>
            {!incomingRequest && !isCaller && (
              <>
                <h2 className="text-3xl font-semibold text-gray-800">
                  Not Connected
                </h2>
                <p className="text-gray-500 mt-2">
                  Select a user from the left panel to send a connection
                  request.
                </p>
              </>
            )}

            {isCaller && !incomingRequest && (
              <div className="text-gray-700">
                <h2 className="text-2xl font-bold">
                  Waiting for user to accept…
                </h2>
              </div>
            )}
          </div>
        )}

        {connectedRoom && (
          <div>
            <h2 className="text-3xl font-bold text-green-600">
              Connected Room
            </h2>
            <p className="text-gray-600 mt-2">{connectedRoom}</p>
          </div>
        )}
      </main>
      //Incoming Request Popup ONLY for target user
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-80">
            <h3 className="text-xl font-bold mb-3">Incoming Request</h3>
            <p className="mb-4">{incomingRequest} wants to connect</p>

            <div className="space-y-2">
              <button
                onClick={() => acceptRequest(incomingRequest)}
                className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
              >
                Accept
              </button>

              <button
                onClick={() => {}}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
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
