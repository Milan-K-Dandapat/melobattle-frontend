import { useMusic } from "../context/MusicContext";
import { useState } from "react";
import { Volume2, VolumeX, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MusicPlayer = ({ variant = "floating", isOpen }) => {
  const { isPlaying, toggleMusic, volume, changeVolume } = useMusic();
  const [showSlider, setShowSlider] = useState(false);

  const handleIconClick = (e) => {
    e.stopPropagation();
    toggleMusic();
    if (variant === "login" || (variant === "floating" && window.innerWidth > 768)) {
      setShowSlider(true);
      setTimeout(() => setShowSlider(false), 4000);
    }
  };

  const adjustVolume = (e, delta) => {
    e.stopPropagation();
    const newVol = Math.min(1, Math.max(0, volume + delta));
    changeVolume(newVol);
  };

  // --- DASHBOARD SIDEBAR VARIANT (For Mobile Sidebar) ---
  if (variant === "sidebar") {
    return (
      <div className="flex flex-col gap-1 w-full">
        <div 
          onClick={handleIconClick}
          className={`flex items-center p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
            isPlaying ? "bg-purple-600/10 text-purple-600 shadow-sm" : "text-slate-500 hover:bg-slate-50"
          }`}
        >
          <div className={`${isOpen ? "mr-4" : "mx-auto"}`}>
            {isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </div>
          {isOpen && <span className="font-black text-sm tracking-tight flex-1 whitespace-nowrap uppercase">Music: {isPlaying ? "On" : "Off"}</span>}
        </div>

        <AnimatePresence>
          {isOpen && isPlaying && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-2 flex items-center justify-between gap-2 overflow-hidden"
            >
              <button onClick={(e) => adjustVolume(e, -0.1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 active:scale-90"><Minus size={14}/></button>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume} 
                onChange={(e) => changeVolume(parseFloat(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-1 bg-slate-200 accent-purple-500 rounded-lg appearance-none cursor-pointer"
              />
              <button onClick={(e) => adjustVolume(e, 0.1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 active:scale-90"><Plus size={14}/></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- FLOATING VARIANT (Login: Responsive | Dashboard: Desktop Only) ---
  return (
    <div className={`fixed z-50 flex flex-col items-center transition-all duration-500 
      ${variant === "login" 
        ? "top-5 right-5 md:top-auto md:bottom-6 md:right-6" 
        : "hidden md:flex bottom-6 right-6" // 🔥 FIXED: This hides the button on mobile dashboard
      }`}
    >
      <AnimatePresence>
        {showSlider && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="mb-4 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-2"
          >
             <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Volume</span>
             <input 
              type="range" min="0" max="1" step="0.01" value={volume} 
              onChange={(e) => changeVolume(parseFloat(e.target.value))} 
              className="w-24 h-1.5 accent-purple-500 cursor-pointer bg-white/20 rounded-lg appearance-none" 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleIconClick}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20"
      >
        {isPlaying ? <Volume2 className="text-white w-6 h-6 animate-pulse" /> : <VolumeX className="text-white w-6 h-6" />}
      </button>
    </div>
  );
};

export default MusicPlayer;