import React, { useEffect, useState } from "react";
import socket from "../../socket";
import { getUserBadge } from "../../utils/getUserBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Clock, Zap, Target, Share2, 
  ChevronRight, Users, Loader2, Star, Award, 
  LayoutDashboard, MessageCircle, Twitter, Activity
} from "lucide-react";
import confetti from 'canvas-confetti';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";
import socket from "../../socket";

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const savedResult = sessionStorage.getItem("lastBattleResult");
const recoveredState = savedResult ? JSON.parse(savedResult) : null;
  
  // 🔥 EXTENDED SYNC: Destructure all stats sent from BattleScreen
  const { 
    score = 0, 
    totalQuestions = 10, 
    correctAnswers = 0,
    timeTaken = "0s", 
    accuracy = 0, 
    rank = 1,
    contestId = null,
    timestamp = new Date().toISOString()
  } = location.state || {};

  const [topWarriors, setTopWarriors] = useState([]);
  const [loadingLB, setLoadingLB] = useState(true);

  // 🔥 NEW: Submission state (ADDED ONLY)
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 🔥 Save result so refresh doesn't break page
useEffect(() => {
  if (location.state) {
    sessionStorage.setItem(
      "lastBattleResult",
      JSON.stringify(location.state)
    );
  }
}, [location.state]);

  // 🔥 ADD THIS FUNCTION RIGHT HERE

  useEffect(() => {
    // 🎊 1. ELITE CELEBRATION PROTOCOL
    if (rank <= 3) {
      // 🔥 Save result so refresh doesn't break the page
      const duration = 4 * 1000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({ particleCount: 2, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#6366f1', '#a855f7'] });
        confetti({ particleCount: 2, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#6366f1', '#a855f7'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    }
  }, [rank]);

  // 🔥 NEW: AUTO SUBMIT BATTLE RESULT (ADDED ONLY)
  useEffect(() => {
    if (!contestId) return;

  

    const submitAndStartPolling = async () => {
      try {
        setIsSubmitting(true);

        const numericTime =
          parseInt(timeTaken.replace("s", ""), 10) || 0;

        // 🔥 Prevent duplicate submit
        const alreadySubmitted =
          sessionStorage.getItem(`submitted_${contestId}`);

        if (!alreadySubmitted) {
          await axiosInstance.post("/contest/submit", {
            contestId,
            score,
            accuracy,
            timeTaken: numericTime
          });

          sessionStorage.setItem(
            `submitted_${contestId}`,
            "true"
          );
        }


      } catch (err) {
        console.log("Submit failed:", err.response?.data);
        setLoadingLB(false);
      } finally {
        setIsSubmitting(false);
      }
    };

   submitAndStartPolling();

   // 🔥 Fetch initial leaderboard (important)
axiosInstance
  .get(`/contest/${contestId}/leaderboard`)
  .then((res) => {
    const lb = res?.data?.data || [];
    setTopWarriors(lb.slice(0, 3));
    setLoadingLB(false);
  })
  .catch(() => {
    setLoadingLB(false);
  });

// 🔥 Join contest room for realtime leaderboard
socket.emit("join_contest", contestId);

// prevent duplicate listeners
socket.off("LEADERBOARD_UPDATE").on("LEADERBOARD_UPDATE", (data) => {

  const lbData =
    data?.data ||
    data ||
    [];

  setTopWarriors(lbData.slice(0,3));
  setLoadingLB(false);

});
    // initial leaderboard fetch

    return () => {
  socket.off("LEADERBOARD_UPDATE");
};

  }, [contestId]);

  /**
   * 🔗 SOCIAL BOAST PROTOCOL
   */
  const handleShare = (platform) => {
    const shareText = `🔥 MATRIX SYNC COMPLETE! 🏆 Rank: #${rank} | Score: ${score} XP | Accuracy: ${accuracy}% on MELO BATTLE! Enter the arena:`;
    const appUrl = window.location.origin;

    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + appUrl)}`);
    } else if (platform === "twitter") {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${appUrl}`);
    }
  };

 // 🔥 Recover result if page refreshes

if (!location.state && !recoveredState) {
  if (contestId) {
    navigate(`/contest-leaderboard/${contestId}`);
  } else {
    navigate("/dashboard");
  }
  return null;
}

  return (
    <div className="min-h-[100dvh] bg-[#0A0C14] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden relative flex flex-col items-center justify-center py-4 px-3 md:py-10 md:px-5">
      
      {/* 🌌 Atmospheric Cyber Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] md:h-[500px] bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)] pointer-events-none" />

      {/* 🛡️ VICTOR CARD (The Compact Box Design) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative overflow-hidden"
      >
        {/* Glow Ring Decor */}
        <div className="absolute -top-10 -left-10 md:-top-20 md:-left-20 w-28 h-28 md:w-40 md:h-40 bg-indigo-500/20 rounded-full blur-[60px] md:blur-[80px]" />
        
        <div className="text-center relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 md:w-28 md:h-28 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-3xl md:rounded-[2.8rem] mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/40 border-2 md:border-4 border-white/10 mb-3 md:mb-6"
          >
            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
          </motion.div>

          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 md:px-4 md:py-1.5 rounded-full mb-3 md:mb-4">
             <Activity className="w-3 h-3 text-emerald-400" />
             <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-emerald-400">Arena Session Finalized</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase mb-4 md:mb-8 leading-none">
            Battle <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Result</span>
          </h1>

          {/* 📊 BENTO STATS GRID (Small Responsive Boxes) */}
          <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-8">
             <StatBox label="FINAL XP" value={score.toLocaleString()} icon={<Zap className="w-3.5 h-3.5 md:w-4 md:h-4"/>} color="text-blue-400" />
             <StatBox label="ACCURACY" value={`${accuracy}%`} icon={<Target className="w-3.5 h-3.5 md:w-4 md:h-4"/>} color="text-emerald-400" />
             <StatBox label="COMBAT SPEED" value={timeTaken} icon={<Clock className="w-3.5 h-3.5 md:w-4 md:h-4"/>} color="text-purple-400" />
             <StatBox label="RANK" value={`#${rank}`} icon={<Award className="w-3.5 h-3.5 md:w-4 md:h-4"/>} color="text-amber-400" />
          </div>

          {/* ⚔️ ARENA STANDINGS (Mini Preview) */}
          <div className="bg-black/40 rounded-3xl md:rounded-[2.5rem] p-3.5 md:p-6 border border-white/5 mb-4 md:mb-8">
             <div className="flex justify-between items-center mb-3 md:mb-5 px-1">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5 md:gap-2">
                   <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-indigo-400" /> Top Warriors
                </span>
                <div className="h-1 w-6 md:w-8 bg-white/5 rounded-full" />
             </div>
             
             <div className="space-y-2 md:space-y-2.5">
                {loadingLB ? (
                   <div className="py-4 md:py-6 flex flex-col items-center">
                      <Loader2 className="animate-spin text-white/20 w-4 h-4 md:w-5 md:h-5" />
                   </div>
                ) : topWarriors.length > 0 ? (
                 topWarriors.map((w, i) => (
                      <LeaderboardRow 
                       key={i} 
                       rank={i+1} 
                       name={w.username || w.name || w.user?.username}
                       score={w.score || w.points || 0}
                       player={w}
                       isUser={
                       w.userId === user?._id ||
                       w._id === user?._id ||
                       w.user?._id === user?._id
                   }
                 />
                ))
                
                ) : (
                   <p className="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase py-4 md:py-6">Awaiting rankings...</p>
                )}
             </div>

             {/* 🔥 DETAILED LEADERBOARD BUTTON: Pointed to correct standings path */}
             <button 
               onClick={() => navigate(`/contest-leaderboard/${contestId}`)}
               className="w-full mt-3 md:mt-5 py-2.5 md:py-4 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-400 transition-all flex items-center justify-center gap-1.5 md:gap-2"
             >
               Detailed Leaderboard <ChevronRight className="w-3 h-3 md:w-3.5 md:h-3.5"/>
             </button>
          </div>

          {/* 🎮 PRIMARY ACTIONS */}
          <div className="space-y-2 md:space-y-3">
             <button 
               onClick={() => navigate('/dashboard')}
               className="w-full py-3.5 md:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-[1.8rem] font-black text-[9px] md:text-xs uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all border-b-[3px] md:border-b-4 border-indigo-900"
             >
               Join Next Battle
             </button>
             
             <div className="grid grid-cols-2 gap-2 md:gap-3">
                <SocialBtn 
                  icon={<MessageCircle className="w-3.5 h-3.5 md:w-4.5 md:h-4.5"/>} 
                  label="WhatsApp" 
                  color="bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                  onClick={() => handleShare('whatsapp')}
                />
                <SocialBtn 
                  icon={<Twitter className="w-3.5 h-3.5 md:w-4.5 md:h-4.5"/>} 
                  label="Twitter" 
                  color="bg-blue-500/10 text-blue-500 border-blue-500/20" 
                  onClick={() => handleShare('twitter')}
                />
             </div>
          </div>
        </div>
      </motion.div>

      {/* Footer Return Nav */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="mt-4 md:mt-10 text-slate-600 hover:text-slate-400 font-black uppercase text-[8px] md:text-[10px] tracking-[0.4em] md:tracking-[0.5em] transition-all flex items-center gap-1.5 md:gap-2 group"
      >
        <LayoutDashboard className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:rotate-12 transition-transform"/> Exit Terminal
      </button>
    </div>
  );
};

/* --- MINI BOX COMPONENTS --- */

const StatBox = ({ label, value, icon, color }) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-2 md:p-4 flex flex-col items-center justify-center gap-1 md:gap-1.5 group hover:bg-white/[0.08] transition-all">
    <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl bg-black/20 ${color} mb-0.5 md:mb-1 group-hover:scale-110 transition-transform`}>{icon}</div>
    <span className="text-[6px] md:text-[7px] font-black text-slate-500 uppercase tracking-tighter">{label}</span>
    <span className="text-xs md:text-base font-black italic text-white tracking-tight">{value}</span>
  </div>
);

const SocialBtn = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center justify-center gap-1.5 md:gap-2 p-2.5 md:p-4 rounded-xl md:rounded-[1.5rem] border font-black text-[8px] md:text-[9px] uppercase tracking-widest transition-all active:scale-95 ${color}`}
  >
     {icon} {label}
  </button>
);

const LeaderboardRow = ({ rank, name, score, isUser, player }) => {

  const badge = getUserBadge(player);

  return (
    <div className={`flex justify-between items-center p-2 md:p-3.5 rounded-xl md:rounded-2xl transition-all ${isUser ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5 border border-transparent'}`}>
      
      <div className="flex items-center gap-2 md:gap-3">

        <span className={`text-[9px] md:text-[10px] font-black ${rank === 1 ? 'text-amber-400' : 'text-slate-500'}`}>
          #{rank}
        </span>

        <div className="flex flex-col">

          <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tight truncate max-w-[120px] ${isUser ? 'text-white' : 'text-slate-300'}`}>
            {name} {isUser && <span className="text-indigo-400 ml-1">★</span>}
          </span>

          {/* 🏆 Badge */}
          {badge && (
            <span className={`text-[7px] font-black uppercase ${badge.color}`}>
              {badge.name}
            </span>
          )}

        </div>

      </div>

      <div className="flex items-center gap-1 md:gap-1.5">
        <span className="text-[9px] md:text-[10px] font-black italic text-indigo-400">
          {score}
        </span>
        <span className="text-[6px] md:text-[7px] font-black text-slate-500 uppercase">
          XP
        </span>
      </div>

    </div>
  );
};

export default QuizResult;