import React, { useEffect, useState } from "react";
import socket from "../../socket";
import jsPDF from "jspdf";
import getUserBadge from "../../utils/getUserBadge";
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


const QuizResult = () => {
const handleDownloadPDF = () => {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const userCode = localStorage.getItem("userCode") || "// No source code log found.";
  const userLanguage = (localStorage.getItem("userLanguage") || "Logic").toUpperCase();
  const userName = (user?.name || user?.username || "Authorized User").toUpperCase();

  // --- 1. SLATE & ANTHRACITE BASE ---
  doc.setFillColor(15, 17, 23); // Deep professional slate
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Subtle Left-side Accent Stripe (Brand Identity)
  doc.setFillColor(255, 215, 0); 
  doc.rect(0, 0, 4, pageHeight, "F");

  // --- 2. ARCHITECTURAL GRID ACCENTS ---
  doc.setDrawColor(40, 45, 60);
  doc.setLineWidth(0.1);
  // Vertical grid lines
  for (let i = 20; i < pageWidth; i += 40) {
    doc.line(i, 0, i, pageHeight);
  }

  // --- 3. PREMIUM MINIMALIST BORDER ---
  doc.setDrawColor(70, 75, 90);
  doc.setLineWidth(0.3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // --- 4. HEADER: BRANDING & SERIES ---
  doc.setTextColor(255, 215, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MELO", 18, 22);
  
  doc.setTextColor(100, 105, 120);
  doc.setFont("helvetica", "normal");
  doc.text("|  TECHNICAL ACHIEVEMENT SERIES", 32, 22);

  doc.setFontSize(8);
  doc.text("EST. 2025 / ARENA PROTOCOL v2.0", pageWidth - 18, 22, { align: "right" });

  // --- 5. MAIN TITLES (High Contrast) ---
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE", 20, 55);
  doc.setTextColor(255, 215, 0);
  doc.text("OF MERIT", 20, 72);

  // --- 6. RECIPIENT DATA ---
  doc.setDrawColor(255, 215, 0);
  doc.setLineWidth(1);
  doc.line(20, 80, 60, 80);

  doc.setTextColor(160, 165, 180);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("PROUDLY PRESENTED TO", 20, 95);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(38);
  doc.setFont("times", "bolditalic"); // Elegant contrast
  doc.text(userName, 20, 115);

  // --- 7. ACHIEVEMENT SUMMARY (Refined Typography) ---
  doc.setTextColor(140, 145, 160);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const body = `This document validates the successful completion of the ${userLanguage} Engineering Challenge. The candidate demonstrated exceptional proficiency in real-time logic execution, achieving a verified score of ${score} XP within the Melo Arena environment.`;
  doc.text(body, 20, 130, { maxWidth: 160, lineHeightFactor: 1.6 });

  // --- 8. THE "DATA BLOCK" (Professional Stats) ---
  const startX = 200;
  const startY = 95;

  const drawDataRow = (y, label, value) => {
    doc.setTextColor(100, 105, 120);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(label, startX, y);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(value, startX, y + 7);
    doc.setDrawColor(40, 45, 60);
    doc.line(startX, y + 10, startX + 70, y + 10);
  };

  drawDataRow(startY, "ACCURACY METRIC", `${accuracy}% PRECISION`);
  drawDataRow(startY + 20, "TEMPORAL LATENCY", timeTaken.toUpperCase());
  drawDataRow(startY + 40, "VALIDATION ID", certificateId.split('-')[0].toUpperCase());

  // --- 9. SIGNATURE & STAMP AREA ---
  doc.setDrawColor(255, 215, 0);
  doc.setLineWidth(0.5);
  doc.line(startX, 170, startX + 70, 170);
  doc.setTextColor(255, 215, 0);
  doc.setFontSize(8);
  doc.text("OFFICIAL AUTHENTICATION", startX, 175);
  
  // Digital watermark/Seal
  doc.setGState(new doc.GState({ opacity: 0.1 }));
  doc.setFontSize(60);
  doc.text("MELO", pageWidth - 50, pageHeight - 30, { angle: 30 });
  doc.setGState(new doc.GState({ opacity: 1.0 }));

  // Footer Metadata
  doc.setTextColor(70, 75, 90);
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text(`SYSTEM_AUTH_DATE: ${new Date().toUTCString()}`, 20, 190);

  // --- PAGE 2: ARCHIVAL LOG ---
  doc.addPage();
  doc.setFillColor(10, 12, 16);
  doc.rect(0, 0, pageWidth, pageHeight, "F");
  
  doc.setTextColor(255, 215, 0);
  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text("> ARCHIVAL_ENCODING_LOG", 15, 20);
  
  doc.setTextColor(100, 105, 120);
  doc.setFontSize(7);
  doc.setFont("courier", "normal");
  const splitCode = doc.splitTextToSize(userCode, pageWidth - 30);
  doc.text(splitCode, 15, 35);

  doc.save(`Melo_Professional_${userName.replace(/\s+/g, '_')}.pdf`);
};
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
  timestamp = new Date().toISOString(),
  warnings = 0   // ✅ ADD THIS
} = location.state || {};
const certificateId = `MELO-${Date.now()}-${Math.floor(Math.random()*1000)}`;

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
  onClick={handleDownloadPDF}
  className="w-full py-3 bg-black border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
>
  Download Report PDF
</button>
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