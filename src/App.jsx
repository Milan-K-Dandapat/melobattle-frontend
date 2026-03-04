import { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast"; 
import { Trophy, X } from "lucide-react"; 
import ArenaIntro from "./components/ArenaIntro";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { MusicProvider } from "./context/MusicContext";
import { SocketProvider, useSocket } from "./context/SocketContext"; 

/**
 * 🔥 SEASON NOTIFIER COMPONENT
 * Listens for system-wide resets and broadcasts high-impact notifications.
 */
const SeasonResetListener = () => {
  const socket = useSocket();
  const { user } = useAuth(); 

  useEffect(() => {
    if (!socket || !user) return;

    socket.on("SEASON_RESET", (data) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0F172A] shadow-2xl rounded-[2rem] pointer-events-auto flex ring-1 ring-purple-500/50 p-6 border border-white/10 backdrop-blur-xl`}>
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-900/40">
                  <Trophy className="text-white" size={20} />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-xs font-black text-purple-400 uppercase tracking-widest">
                  {data.type} RESET COMPLETE
                </p>
                <p className="mt-1 text-sm font-bold text-white uppercase italic leading-tight">
                  {data.message}
                </p>
              </div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button onClick={() => toast.dismiss(t.id)} className="text-slate-500 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      ), { duration: 8000 });
    });

    return () => socket.off("SEASON_RESET");
  }, [socket, user]); 

  return null;
};

function App() {
  const [entered, setEntered] = useState(false);

  const handleEnter = () => {
    setEntered(true);
  };

  return (
    <AuthProvider>
      <SocketProvider>
        <MusicProvider>
          {/* 🔥 Premium Global Toaster - Z-Index 99999 for Overlay Priority */}
          <Toaster 
            position="top-center" 
            toastOptions={{
              style: {
                background: '#0F172A',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                fontSize: '14px',
                fontWeight: 'bold',
              },
              containerStyle: {
                zIndex: 99999, 
              }
            }} 
          />
          
          {!entered ? (
            <ArenaIntro onEnter={handleEnter} />
          ) : (
            <div className="relative min-h-screen overflow-hidden bg-[#050810]">
              {/* 🔥 Matrix System Listener */}
              <SeasonResetListener />

              {/* 🌌 High-Performance Gaming Background */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="fixed inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
              >
                <source src="/videos/gaming-bg.mp4" type="video/mp4" />
              </video>

              {/* Matrix Overlay Gradients */}
              <div className="fixed inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
              <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.15)_0%,transparent_100%)] pointer-events-none" />

              {/* 🚀 Main Route Interface */}
              {/* Ensure your AppRoutes.jsx includes the new battle-lobby and battle/:id routes */}
              <div className="relative z-10">
                <AppRoutes />
              </div>
            </div>
          )}
        </MusicProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;