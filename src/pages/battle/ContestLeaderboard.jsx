import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, ArrowLeft, Zap, Target, Timer, 
  User, Medal, Search, Crown, Star, ShieldCheck,
  Gamepad2, BarChart3
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";
import getUserBadge from "../../utils/getUserBadge";

const ContestLeaderboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState([]);
  const [contestInfo, setContestInfo] = useState(null);

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        // 1. Fetch metadata for the header
        const contestRes = await axiosInstance.get(`/contest/${id}`);
        setContestInfo(contestRes?.data?.data || contestRes?.data);

        /**
         * 2. 🔥 FETCH STANDINGS: Uses the fixed static route
         * URL: /api/contest/leaderboard/:contestId
         */
        const standingsRes = await axiosInstance.get(`/contest/${id}/leaderboard`);
        console.log("Leaderboard API response:", standingsRes.data);
        const data = standingsRes?.data?.data || [];
        
        // Ensure data is sorted by rank if provided, otherwise by score
        const sortedData = Array.isArray(data)
  ? [...data].sort((a, b) => (b.score || 0) - (a.score || 0))
  : [];
          
        setStandings(sortedData);
      } catch (err) {
        console.error("Standings Sync Failed:", err);
        // toast.error("Failed to sync arena standings.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStandings();
  }, [id]);

  // Separate top 3 for the Podium view
  const podium = useMemo(() => {
    return [
      standings[0] || null,
      standings[1] || null,
      standings[2] || null
    ];
  }, [standings]);

  const remaining = useMemo(() => standings, [standings]);

  if (loading) return <StandingsLoader />;

  return (
    <div className="min-h-[100dvh] bg-[#050810] text-white font-sans selection:bg-purple-500/30">
      {/* --- CYBER HEADER --- */}
      <header className="sticky top-0 z-50 bg-[#050810]/80 backdrop-blur-xl border-b border-white/5 px-3 py-3 md:px-6 md:py-4 flex items-center gap-2 md:gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 shrink-0"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-purple-500 leading-none mb-0.5 md:mb-1 truncate">Battle Standings</h1>
          <p className="text-sm md:text-lg font-black italic tracking-tighter truncate uppercase">{contestInfo?.title || "Arena Matrix"}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl flex flex-col items-end shrink-0">
           <span className="text-[7px] md:text-[8px] font-black uppercase text-emerald-500 tracking-widest">Prize Pool</span>
           <span className="text-xs md:text-sm font-black text-white">₹{contestInfo?.prizePool || 0}</span>
        </div>
      </header>

      <main className="p-3 sm:p-4 md:p-6 max-w-2xl mx-auto space-y-6 md:space-y-8 pb-28 md:pb-32">
        
        {/* --- THE PODIUM (Top 3 Warriors) --- */}
        <div className="grid grid-cols-3 items-end gap-1 sm:gap-2 pt-6 md:pt-10 pb-2 md:pb-4 relative min-h-[160px] md:min-h-[220px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(147,51,234,0.15)_0%,_transparent_70%)] pointer-events-none" />
          
          {/* Rank 2 */}
          <PodiumCard user={podium[1]} rank={2} color="text-slate-300" border="border-slate-400/30" />
          
          {/* Rank 1 (The King) */}
          <PodiumCard user={podium[0]} rank={1} color="text-amber-400" border="border-amber-400/50" isWinner />
          
          {/* Rank 3 */}
          <PodiumCard user={podium[2]} rank={3} color="text-orange-400" border="border-orange-400/30" />
        </div>

        {/* --- FULL STANDINGS LIST --- */}
        <div className="space-y-2 md:space-y-3">
          <div className="flex justify-between px-2 md:px-4 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 md:mb-4">
             <span>Warrior Standing</span>
             <div className="flex gap-6 md:gap-12">
                <span>Stats</span>
                <span>Winnings</span>
             </div>
          </div>
          
          {remaining.length > 0 ? (
            remaining.map((player) => (
              <StandingRow key={player.userId || player._id} player={player} />
            ))
          ) : standings.length <= 3 && standings.length > 0 ? (
            <div className="py-12 md:py-20 text-center border-2 border-dashed border-white/5 rounded-3xl md:rounded-[2.5rem]">
               <p className="text-slate-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">End of Arena Data</p>
            </div>
          ) : (
            <div className="py-12 md:py-20 text-center bg-white/5 rounded-3xl md:rounded-[2.5rem] border border-white/5">
                <Gamepad2 className="w-8 h-8 md:w-10 md:h-10 mx-auto text-slate-700 mb-3 md:mb-4 opacity-20" />
                <p className="text-slate-500 font-black uppercase text-[8px] md:text-[10px] tracking-[0.2em]">No Warrior Data synchronized yet</p>
            </div>
          )}
        </div>
      </main>

      {/* --- FLOATING HUB ACTION --- */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-[#050810] via-[#050810] to-transparent pointer-events-none">
        <button 
          onClick={() => navigate('/dashboard')}
          className="pointer-events-auto w-full max-w-md mx-auto py-3.5 md:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-[0_15px_30px_rgba(147,51,234,0.3)] md:shadow-[0_20px_50px_rgba(147,51,234,0.3)] border border-white/20 active:scale-95 transition-all block text-center"
        >
          Return to Hub
        </button>
      </footer>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const PodiumCard = ({ user, rank, color, border, isWinner = false }) => {
  const badge = getUserBadge(user?.rating || 0, user?.wins || 0);
  const BadgeIcon = badge.icon;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.1 }}
     className={`flex flex-col items-center gap-2 md:gap-3
${isWinner ? 'order-2 z-10 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]'
: rank === 2 ? 'order-1 drop-shadow-[0_0_15px_rgba(203,213,225,0.5)]'
: 'order-3 drop-shadow-[0_0_12px_rgba(251,146,60,0.4)]'}`}
    >
      <div className={`relative ${isWinner ? 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24' : 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'}`}>
        
        {isWinner && (
          <Crown
            className="absolute -top-4 md:-top-6 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] w-6 h-6 md:w-8 md:h-8"
            fill="currentColor"
          />
        )}

        <div className={`w-full h-full rounded-2xl md:rounded-[2rem] border-2 ${border} overflow-hidden p-0.5 md:p-1 bg-white/5 backdrop-blur-md`}>
          <img
            src={
              user?.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || rank}`
            }
            className="w-full h-full object-cover rounded-[0.9rem] md:rounded-[1.8rem]"
            alt=""
          />
        </div>

        <div
          className={`absolute -bottom-1.5 md:-bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 md:w-8 md:h-8 rounded-md md:rounded-xl bg-[#050810] border ${border} flex items-center justify-center font-black text-[9px] md:text-xs ${color}`}
        >
          {rank}
        </div>
      </div>

      <div className="text-center mt-0.5 md:mt-0">

        {/* USERNAME */}
        <p
          className={`font-black text-[9px] md:text-xs uppercase tracking-tighter truncate w-16 sm:w-20 md:w-24 ${
            isWinner ? "text-white" : "text-slate-400"
          }`}
        >
          {user ? user.username : "Waiting..."}
        </p>

        {/* BADGE */}
        <div className="flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
  {BadgeIcon && <BadgeIcon className={`w-3 h-3 ${badge.color}`} />}

  {/* BADGE */}
<div className="flex items-center gap-1 mt-0.5">
  {BadgeIcon && <BadgeIcon className={`w-3 h-3 ${badge.color}`} />}

  <span className={`text-[7px] md:text-[8px] font-black ${badge.color}`}>
    {badge.name}
  </span>
</div>
</div>
        {/* SCORE */}
        <p className={`text-[8px] md:text-[10px] font-black italic ${color}`}>
          {user && typeof user.score === "number"
            ? Math.floor(user.score).toLocaleString() + " XP"
            : "--"}
        </p>

        {/* PRIZE */}
        {user?.prizeWon > 0 && (
          <span className="text-[8px] md:text-[10px] font-black text-emerald-400">
            ₹{user.prizeWon}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const StandingRow = ({ player }) => {
  const navigate = useNavigate();
  const badge = getUserBadge(player?.rating || 0, player?.wins || 0);
  const BadgeIcon = badge.icon;

  return (
    <motion.div
      onClick={() => navigate(`/profile/${player.userId}`)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-xl md:rounded-[2rem] bg-white/5 border border-white/5 transition-all hover:bg-white/10 cursor-pointer ${
        player.isCurrentUser
          ? "bg-purple-600/10 border-purple-500/30"
          : ""
      }`}
    >
     <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
  <span className="w-4 md:w-6 text-center font-black text-[9px] md:text-xs text-slate-500 italic shrink-0">
    {player.rank === 1 ? "🥇" :
     player.rank === 2 ? "🥈" :
     player.rank === 3 ? "🥉" :
     player.rank ? `#${player.rank}` : "--"}
  </span>

        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-white/5 p-0.5 border border-white/10 shrink-0">
          <img
            src={
              player.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username}`
            }
            className="w-full h-full object-cover rounded-[0.4rem] md:rounded-[1rem]"
            alt=""
          />
        </div>

       <div className="min-w-0 flex-1">
  <div>
    <p className="font-black text-[10px] sm:text-xs md:text-sm uppercase tracking-tight flex items-center gap-1.5 truncate">
      <span className="truncate">{player.username}</span>

      {player.isCurrentUser && (
        <span className="text-[6px] md:text-[8px] bg-purple-600 px-1.5 md:px-2 py-0.5 rounded-full font-black tracking-widest shrink-0">
          (YOU)
        </span>
      )}
    </p>

    {/* BADGE */}
    <span className={`text-[7px] md:text-[8px] font-black ${badge.color}`}>
      {badge.name}
    </span>
  </div>

  <div className="flex items-center gap-2 md:gap-3 mt-0.5 md:mt-1">
    <div className="flex items-center gap-1 text-[7px] sm:text-[8px] md:text-[9px] font-bold text-slate-500 uppercase">
      {player.accuracy || 0}%
    </div>

    <div className="flex items-center gap-1 text-[7px] sm:text-[8px] md:text-[9px] font-bold text-slate-500 uppercase">
      {player.time || 0}s
    </div>
  </div>
</div>
</div>

      <div className="text-right shrink-0 ml-2">
        <p className="text-[10px] sm:text-xs md:text-sm font-black italic tracking-tighter text-white">
          {Math.floor(player.score || 0).toLocaleString()} XP
        </p>
      </div>
    </motion.div>
  );
};

const StandingsLoader = () => (
  <div className="min-h-[100dvh] bg-[#050810] flex flex-col items-center justify-center p-6 md:p-10">
    <div className="relative w-12 h-12 md:w-20 md:h-20 mb-6 md:mb-8">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-full h-full border-2 md:border-4 border-purple-500/20 border-t-purple-600 rounded-full" />
      <div className="absolute inset-0 flex items-center justify-center"><Medal className="w-6 h-6 md:w-8 md:h-8 text-purple-500 animate-pulse"/></div>
    </div>
    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-purple-500 animate-pulse text-center">Syncing Battle Results</p>
  </div>
);

export default ContestLeaderboard;