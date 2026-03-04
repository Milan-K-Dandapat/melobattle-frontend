import { memo } from "react"; // 🔥 Required to stop flickering
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Timer, Users, Trophy, Zap } from "lucide-react";

/**
 * 🔥 PERFORMANCE PROTOCOL: React.memo
 * Prevents the card from re-rendering unless its specific data changes.
 * This stops the "flicker" when other contests are updated via sockets.
 */
const ContestCard = memo(({ id, title, prize, entry, joinedCount, maxParticipants, time, category, bannerImage, isJoined }) => {
  const navigate = useNavigate();
  
  // Logic calculations
  const fillPercentage = Math.min((joinedCount / maxParticipants) * 100, 100);
  const isFillingFast = fillPercentage >= 80;

  return (
    <motion.div
      layout // 🔥 Smooths out position shifts without flickering
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/contest/${id}`)}
      className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 cursor-pointer relative overflow-hidden group hover:border-purple-200 transition-colors"
    >
      {/* 🖼️ LAPTOP BANNER BACKGROUND PROTOCOL */}
      {bannerImage && (
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
          <img src={bannerImage} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Persistence Badge */}
      {isJoined && (
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest z-10 shadow-lg">
          Already Joined ⚔️
        </div>
      )}

      {!isJoined && isFillingFast && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-widest animate-pulse z-10">
          Filling Fast!
        </div>
      )}

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              {category || 'General'} Quiz
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2 tracking-tight leading-tight uppercase italic">
              {title}
            </h3>
          </div>
          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
            <Trophy className="text-emerald-600" size={20} />
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <p className="text-slate-500 text-[11px] font-bold flex items-center gap-1.5 uppercase">
            <Timer size={14} className="text-purple-400" /> {time}
          </p>
          <p className="text-slate-500 text-[11px] font-bold flex items-center gap-1.5 uppercase">
            <Users size={14} className="text-purple-400" /> {joinedCount}/{maxParticipants}
          </p>
        </div>

        <div className="space-y-2 mb-6">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-50">
            <motion.div 
              initial={false} // 🔥 Prevents progress bar "flicker" on every render
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full"
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 group-hover:bg-purple-50 transition-colors">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prize Pool</p>
            <p className="text-lg font-black text-emerald-600 italic">₹{prize}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry Fee</p>
            <p className="text-lg font-black text-purple-600 italic">₹{entry}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Set display name for DevTools
ContestCard.displayName = "ContestCard";

export default ContestCard;