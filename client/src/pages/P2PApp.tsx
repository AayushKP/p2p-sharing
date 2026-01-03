import { useState } from "react";
import { useWS } from "../context/WebSocketContext";
import FileTransfer from "../components/FileTransfer";
import { 
  Menu, 
  X, 
  User, 
  Users, 
  Share2, 
  Shield, 
  Zap, 
  MousePointerClick,
  ArrowRight
} from "lucide-react";

export default function P2PApp() {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-black text-white overflow-hidden font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between z-20 sticky top-0">
         <div className="flex items-center gap-2">
           <Share2 className="text-blue-500" size={20} />
           <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">P2P Share</h1>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
            {isSidebarOpen ? <X size={20} className="text-gray-300" /> : <Menu size={20} className="text-gray-300" />}
         </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Share2 className="text-blue-500" size={24} />
            </div>
            <h1 className="text-xl font-bold font-mono">Peerly</h1>
          </div>
          <p className="text-sm text-gray-500 ml-1">Secure WebRTC File Transfer</p>
        </div>

        <div className="p-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-800">
          <div className="mb-6 rounded-xl bg-gray-800/50 border border-gray-700/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <User size={16} className="text-blue-400" />
              <span>Your Identity</span>
            </div>
            <div className="text-xs text-gray-500 bg-black/40 p-2 rounded border border-gray-800 break-all font-mono">
              {myId}
            </div>
          </div>

          <h2 className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-1">
            <Users size={14} />
            Online Users ({users.length})
          </h2>

          <div className="space-y-3">
            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500 bg-gray-800/20 rounded-lg border border-dashed border-gray-800">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users online</p>
                <p className="text-xs mt-1">Wait for peers to join...</p>
              </div>
            )}

            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                   sendConnectionRequest(u.id);
                   setIsSidebarOpen(false);
                }}
                className="group w-full text-left p-3 rounded-xl bg-gray-800/40 hover:bg-gray-800 border border-transparent hover:border-gray-700 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-medium text-gray-200">Peer User</span>
                  </div>
                  <ArrowRight size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
                <div className="text-xs text-gray-500 font-mono pl-4 truncate opacity-60 group-hover:opacity-100 transition-opacity">
                  {u.id}
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 w-full bg-black relative flex flex-col">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center relative z-10 w-full">
        {!connectedRoom && (
          <div className="w-full max-w-2xl flex flex-col items-center justify-center text-center">
            {!incomingRequest && !isCaller && (
              <div className="space-y-6">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
                  <div className="relative bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-2xl">
                    <Zap size={48} className="text-blue-500" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Connect & Share
                  </h2>
                  <p className="text-gray-400 max-w-md mx-auto text-lg leading-relaxed">
                    Select a user from the sidebar to establish a secure, peer-to-peer encrypted connection.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 w-full max-w-lg mx-auto">
                    {[
                      { icon: Shield, label: "End-to-End Encrypted" },
                      { icon: Zap, label: "Lightning Fast" },
                      { icon: MousePointerClick, label: "One-Click Connect" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                        <item.icon size={20} className="text-gray-500 mb-2" />
                        <span className="text-xs text-gray-400">{item.label}</span>
                      </div>
                    ))}
                </div>

                <div className="md:hidden pt-8">
                   <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium transition shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                   >
                     Browse Online Users
                   </button>
                </div>
              </div>
            )}

            {isCaller && !incomingRequest && (
              <div className="flex flex-col items-center animate-pulse space-y-4">
                <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Users size={32} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Waiting for connection...
                </h2>
                <p className="text-gray-500">
                  Request has been sent to the peer.
                </p>
              </div>
            )}
          </div>
        )}

        {connectedRoom && (
          <div className="w-full max-w-4xl flex flex-col items-center">
            <div className="mb-8 flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium text-sm">Encrypted Connection Active</span>
              <div className="w-px h-4 bg-green-500/20 mx-1" />
              <span className="text-xs text-gray-400">
                {isCaller ? "Sending Mode" : "Receiving Mode"}
              </span>
            </div>

            <FileTransfer />
          </div>
        )}
        </div>
      </main>

      {/* Incoming Request Modal */}
      {incomingRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                 <Users size={32} className="text-blue-500" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">Incoming Request</h3>
                <p className="text-gray-400 text-sm mt-2 break-all px-4">
                  <span className="text-white font-mono bg-gray-800 px-1 py-0.5 rounded">{incomingRequest}</span> <br/>
                  wants to send you a file.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => rejectRequest(incomingRequest)}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-medium transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={() => acceptRequest(incomingRequest)}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all"
                >
                  Accept
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
