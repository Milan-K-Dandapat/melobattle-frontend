import { useEffect } from "react";
import { motion } from "framer-motion";

const ArenaIntro = ({ onEnter }) => {
  // Automatically trigger the enter function after the animation finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnter();
    }, 3500); 
    return () => clearTimeout(timer);
  }, [onEnter]);

  // Shared fade-out variant for child elements
  const fadeOutVariant = {
    animate: { opacity: 1, y: 0 },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { duration: 0.5, ease: "easeIn" } 
    }
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden"
    >
      {/* Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-50" />

      <div className="relative text-center px-4 w-full">
        {/* Logo/Icon Placeholder */}
        <motion.div
          variants={fadeOutVariant}
          initial={{ y: 20, opacity: 0 }}
          animate="animate"
          exit="exit"
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 flex justify-center"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-2xl rotate-12 flex items-center justify-center shadow-[0_0_50px_rgba(var(--primary-rgb),0.4)]">
             <span className="text-black text-4xl md:text-5xl font-black -rotate-12">M</span>
          </div>
        </motion.div>

        {/* Main Title - Responsive & Forced Single Line */}
        <motion.h1
          variants={fadeOutVariant}
          initial={{ letterSpacing: "0.4em", opacity: 0, scale: 0.9 }}
          animate={{ letterSpacing: "0.1em", opacity: 1, scale: 1 }}
          exit="exit"
          transition={{ duration: 1, delay: 0.4 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-3 text-white italic uppercase tracking-tighter whitespace-nowrap"
        >
          MELO <span className="text-primary">BATTLE</span>
        </motion.h1>

        {/* Powered By Tagline */}
        <motion.div
          variants={fadeOutVariant}
          initial={{ opacity: 0 }}
          animate="animate"
          exit="exit"
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex items-center justify-center gap-3"
        >
          <div className="h-[1px] w-6 md:w-10 bg-gray-700"></div>
          <p className="text-gray-400 font-medium tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-xs uppercase whitespace-nowrap">
            Powered by <span className="text-white font-bold">MELO</span>
          </p>
          <div className="h-[1px] w-6 md:w-10 bg-gray-700"></div>
        </motion.div>

        {/* Loading Shimmer Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-12 w-32 md:w-48 h-1 bg-gray-900 rounded-full mx-auto overflow-hidden"
        >
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ArenaIntro;