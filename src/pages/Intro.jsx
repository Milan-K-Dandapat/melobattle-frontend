import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Intro = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("logo"); 
  const [loading, setLoading] = useState(false);

  // Phase control
  useEffect(() => {
    const logoTimer = setTimeout(() => {
      setPhase("video");
    }, 2500);

    return () => clearTimeout(logoTimer);
  }, []);

  const handleVideoEnd = () => {
    setLoading(true);

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">

      {/* SKIP BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 right-6 z-50 px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-lg hover:bg-white/20 transition"
      >
        Skip ▶
      </button>

      {/* LOGO EXPLOSION PHASE */}
     <AnimatePresence>
  {phase === "logo" && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center px-4 text-center"
    >
      {/* Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 0.7 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 1.2 }}
        className="absolute w-32 h-32 sm:w-48 sm:h-48 rounded-full border-4 border-purple-500"
      />

      {/* Glow Background */}
      <div className="absolute w-72 h-72 sm:w-[500px] sm:h-[500px] bg-purple-500/20 blur-3xl rounded-full" />

      {/* MAIN TEXT */}
      <motion.h1
        initial={{ scale: 0.6 }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5 }}
        className="relative font-extrabold tracking-widest
                   text-3xl sm:text-5xl md:text-7xl lg:text-8xl
                   bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500
                   bg-clip-text text-transparent"
      >
        MELO BATTLE
      </motion.h1>
    </motion.div>
  )}
</AnimatePresence>

      {/* VIDEO PHASE */}
     {phase === "video" && !loading && (
  <motion.video
    autoPlay
    playsInline
    onEnded={handleVideoEnd}
    className="
      absolute inset-0
      w-full h-full
      object-cover
      object-center
      scale-105 sm:scale-100
    "
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    <source src="/videos/intro1.mp4" type="video/mp4" />
  </motion.video>
)}

      {/* LOADING OVERLAY */}
     <AnimatePresence>
  {loading && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-black px-4 text-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-purple-500 border-t-transparent rounded-full"
      />

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 font-bold tracking-widest
                   text-2xl sm:text-4xl md:text-6xl
                   bg-gradient-to-r from-purple-500 to-pink-500
                   bg-clip-text text-transparent"
      >
        MELO BATTLE
      </motion.h2>

      <p className="mt-3 text-gray-400 text-sm sm:text-base">
        ENTERING ARENA...
      </p>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default Intro;