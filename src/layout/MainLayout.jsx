import { Outlet } from "react-router-dom"; 
import bgVideo from "/videos/gaming-bg.mp4"; 
import MusicPlayer from "../components/MusicPlayer";
import { motion } from "framer-motion";

const MainLayout = () => {
  return (
    <div className="relative min-h-screen bg-[#050810] selection:bg-purple-500/30">
      
      {/* 🌌 IMMERSIVE BACKGROUND LAYER */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute w-full h-full object-cover opacity-30"
        >
          <source src={bgVideo} type="video/mp4" />
        </video>

        {/* Matrix Overlay: Dark Gradient + Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(147,51,234,0.15)_0%,transparent_50%)]" />
        
        {/* Subtle Backdrop Blur */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>

      {/* 🚀 CONTENT ARCHITECTURE */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <main className="flex-grow">
          {/* 🔥 Outlet renders the Dashboard, ContestDetails, Profile, etc. */}
          <Outlet /> 
        </main>
        
        {/* Fixed System Components */}
        <MusicPlayer />
      </div>

      {/* 🛡️ GLOBAL SYSTEM DECORATION (Optional Scanlines) */}
      <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

export default MainLayout;