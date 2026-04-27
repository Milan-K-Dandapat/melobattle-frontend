import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { 
  Trophy, Users, Timer, ArrowLeft, ShieldCheck, Flame, 
  ChevronRight, Info, AlertCircle, Zap, Swords, Clock, 
  ShieldAlert, Share2, Wallet, Target, BarChart3, 
  Camera, RefreshCcw, Layout, CheckCircle2, AlertTriangle,
  Lock, // <--- Add this icon
  Image as ImageIcon 
} from "lucide-react";

const ContestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State definitions
  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [joined, setJoined] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const actionLock = useRef(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loginUserId, setLoginUserId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    }));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (!contest) setLoading(true);
      const [contestRes, lbRes] = await Promise.all([
        axiosInstance.get(`/contest/${id}`),
        axiosInstance.get(`/contest/${id}/leaderboard`)
      ]);
      
      const contestData = contestRes?.data?.data || contestRes?.data || contestRes;
      if (contestData) {
        setContest(contestData);
        setJoined(prev => prev || contestData.isJoined === true);
        setIsCompleted(contestData.isCompletedByUser === true); 
      }
      
      const lbData = lbRes?.data?.data || lbRes?.data || lbRes;
      setLeaderboard(Array.isArray(lbData) ? lbData : []);
    } catch (err) {

  // 🔥 Ignore aborted axios requests
  if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
    return;
  }

  console.error("Sync Error:", err);
  toast.error("Arena connection lost.");
  
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

const handleAction = async () => {

  // 🔒 Prevent spam clicking
  if (actionLock.current) return;
  actionLock.current = true;
  if (isCompleted) {
  actionLock.current = false;
  navigate(`/contest-leaderboard/${id}`);
  return;
}

  if (joined) {
  actionLock.current = false;
    const now = new Date().getTime();
    const startTime = new Date(contest?.startTime).getTime();
    let endTime = Infinity;

if (!contest?.isInstantBattle) {
  const durationMs = (contest?.duration || 15) * 60 * 1000;
  endTime = startTime + durationMs;
}
    
    // 🔥 ALWAYS go to Lobby if early.
    if (!contest?.isInstantBattle && now < startTime - 2000) {
      toast("ENTERING PRE-BATTLE LOBBY", { icon: '⏳' });
      navigate(`/battle-lobby/${id}`);
    } else if (now >= startTime && now <= endTime) {

  // 🔥 ADD THIS SAFETY BUFFER (IMPORTANT)
  if (!contest?.isInstantBattle && now < startTime + 3000) {
    navigate(`/battle-lobby/${id}`);
    return;
  }

  toast.success("ARENA LIVE: COMMENCING BATTLE!");

  if (contest?.category === "LIVE CODING SOLVE") {
    navigate(`/live-compiler/${id}`);
  } 
  else if (contest?.category === "QUIZ") {
    navigate(`/quiz/${id}`);
  }
  else {
    navigate(`/battle/${id}`);
  }
    } else if (!contest?.isInstantBattle && now > endTime && joined) {
  toast.error("BATTLE TERMINATED: SESSION CLOSED");
  navigate(`/contest-leaderboard/${id}`);
}
     else {
  if (contest?.category === "LIVE CODING SOLVE") {
    navigate(`/live-compiler/${id}`);
  } 
  else if (contest?.category === "QUIZ") {
    navigate(`/quiz/${id}`);
  }
  else {
    navigate(`/battle/${id}`);
  }
}
    return;
  }

 if (!contest) {
  actionLock.current = false;
  return;
}

if ((contest.joinedCount || 0) >= (contest.maxParticipants || 0)) {
  toast.error("ARENA FULL!");
  actionLock.current = false;
  return;
}

try {
  setJoining(true);

  const res = await axiosInstance.post(`/contest/${id}/join`);

  const responseData = res?.data;

if (responseData?.isJoined === true) {

  setJoined(true);

  const updatedJoinedCount =
    responseData?.joinedCount ||
    (contest?.joinedCount || 0) + 1;

  setContest(prev => ({
    ...(prev || {}),
    isJoined: true,
    joinedCount: updatedJoinedCount,
    participants: (prev?.participants || []).some(p => (p._id || p.userId) === user?._id)
      ? prev?.participants || []
      : [
          ...(prev?.participants || []),
          {
            _id: user?._id,
            username: user?.username || user?.name,
            points: user?.rating || user?.points || user?.xp || 0 
          }
        ]
  }));

  // ✅ ADD THESE 2 LINES
  setJoining(false);
  actionLock.current = false;

  toast.success("WARRIOR REGISTERED! ⚔️", {
    style: { background: '#10b981', color: '#fff', fontWeight: 'bold' }
  });

  return;
}
} catch (err) {

  // 🔥 Ignore cancelled requests
  if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
    return;
  }

  const errorMsg = err.response?.data?.message || "";

  if (errorMsg.includes("already joined") || errorMsg.includes("already deployed")) {
    setJoined(true);
    setContest(prev => ({ ...prev, isJoined: true }));
    toast.success("WARRIOR ALREADY AUTHORIZED! ⚔️");
    return;
  }
  toast.error(errorMsg || "Join failed.");
} finally {
  setJoining(false);
  actionLock.current = false;
}
};
  const currentJoined = contest?.joinedCount || 0;
  const maxSpots = contest?.maxParticipants || 1;
  const percentage = Math.min((currentJoined / maxSpots) * 100, 100);
  const isArenaFull = currentJoined >= maxSpots;

  const getFormattedTime = (dateString) => {
    if (!dateString) return "UPCOMING";
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleShare = async () => {
  if (!contest) return;

  const shareData = {
    title: contest?.title,
    text: `Challenge me in "${contest?.title}" for ₹${contest?.prizePool}!`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link Copied!");
    }
  } catch (err) {
    console.error(err);
  }
};
if (showInstructions) {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4 font-sans">
      {/* Main Exam Container */}
      <div className="w-full max-w-4xl bg-white shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] rounded-sm border border-gray-300 overflow-hidden">
        
        {/* CBT Header Bar */}
        <div className="bg-[#1e40af] text-white px-6 py-4 flex justify-between items-center border-b-4 border-yellow-500">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-sm">
               <ShieldCheck className="w-6 h-6 text-[#1e40af]" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight uppercase tracking-wide">Candidate Instructions</h1>
              <p className="text-[10px] text-blue-100 opacity-80 uppercase tracking-widest">Melo Examination Services • Session 2026</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] uppercase text-blue-200">System Time</p>
            <p className="text-sm font-mono font-bold">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Examination Body */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-200">
            <Info className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-800">General Instructions & Guidelines</h2>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
            <section>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-gray-800 text-white text-[10px] flex items-center justify-center rounded-full">01</span>
                Hardware & Environment
              </h3>
              <p className="pl-8 text-sm">
                Candidates must ensure their web camera is active throughout the duration of the examination. 
                <span className="font-bold text-red-600"> Obstruction of the camera view </span> will result in automatic termination of the session.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-gray-800 text-white text-[10px] flex items-center justify-center rounded-full">02</span>
                Browser Restrictions
              </h3>
              <p className="pl-8 text-sm">
                This assessment is conducted in a locked environment. Tab switching, window resizing, or navigating away from the exam interface is 
                <span className="font-bold underline"> strictly prohibited</span>. The system logs all navigation events.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-gray-800 text-white text-[10px] flex items-center justify-center rounded-full">03</span>
                Session Continuity
              </h3>
              <p className="pl-8 text-sm">
                Do not attempt to refresh (<RefreshCcw className="inline w-3 h-3" />) the browser. In case of a connectivity failure, wait for the system to attempt auto-reconnection. Manual refreshing may invalidate your response data.
              </p>
            </section>

            <section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-md">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  <strong>Warning:</strong> Any detection of secondary devices, unauthorized software, or AI assistants will be flagged by the proctoring engine for immediate disqualification.
                </p>
              </div>
            </section>
          </div>

          {/* Acknowledgement Footer */}
          <div className="mt-10 pt-6 border-t border-gray-200">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none border border-gray-400 rounded-sm checked:bg-blue-600 checked:border-blue-600 transition-all"
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                />
                <CheckCircle2 className="absolute w-5 h-5 text-white scale-0 peer-checked:scale-75 transition-transform pointer-events-none" />
              </div>
              <span className="text-sm font-medium text-gray-800 select-none group-hover:text-blue-700 transition-colors">
                I have read and understood the instructions. I agree that I am the authorized candidate and will abide by the rules stated above.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 px-8 py-5 flex items-center justify-between border-t border-gray-300">
          <div className="text-[11px] text-gray-500 font-medium italic">
            IP Address Logged: 103.21.XX.XX
          </div>
          <button
            disabled={!isChecked}
            onClick={() => {
              setShowInstructions(false);
              const now = new Date().getTime();
              const startTime = new Date(contest?.startTime).getTime();
              if (contest?.startTime && now < startTime) {
                navigate(`/battle-lobby/${id}`);
                return;
              }
              setShowLogin(true);
            }}
            className={`flex items-center gap-2 px-10 py-3 rounded-sm font-bold text-sm transition-all shadow-md ${
              isChecked
                ? "bg-emerald-600 text-white hover:bg-emerald-700 active:translate-y-0.5"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            PROCEED TO EXAM
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <LoadingMatrix key="loader" />
      ) : (
        <motion.div 
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-44 relative overflow-hidden"
        >
          <div className="fixed inset-0 pointer-events-none z-0">
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ y: "110%", opacity: 0 }}
                animate={{ 
                  y: "-10%", 
                  opacity: [0, 0.3, 0.3, 0],
                  x: ["0%", (particle.id % 2 === 0 ? "15%" : "-15%")]
                }}
                transition={{ 
                  duration: particle.duration, 
                  repeat: Infinity, 
                  delay: particle.delay,
                  ease: "linear"
                }}
                className="absolute bg-indigo-300 rounded-full blur-[1px]"
                style={{ 
                  width: particle.size, height: particle.size, 
                  left: particle.left, top: particle.top 
                }}
              />
            ))}
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-indigo-100 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-purple-100 rounded-full blur-[120px] opacity-50" />
          </div>

          <nav className="sticky top-0 z-[100] bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-5 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border border-slate-200 text-slate-600"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
              </motion.button>
              <div>
                <h1 className="text-sm font-black uppercase tracking-tight text-slate-800">Arena <span className="text-indigo-600">Details</span></h1>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Signal</p>
                </div>
              </div>
            </div>
            <button onClick={handleShare} className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 active:scale-95 transition-transform">
              <Share2 size={18} />
            </button>
          </nav>

          <main className="max-w-md mx-auto pt-6 px-4 space-y-6 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden"
            >
              <div className="relative h-44 bg-slate-900">
                {contest?.bannerImage ? (
                  <img src={contest.bannerImage} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center">
                    <Target className="text-white/10" size={60} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20" />
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white text-xs font-medium px-3 py-1 rounded-md">
                     {contest?.category || 'Standard'} League
                  </span>
                </div>
              </div>

              <div className="px-6 pb-8 -mt-6 relative z-10 bg-white/95 rounded-t-[2.5rem] pt-6">
               <h2 className="text-xl font-semibold text-slate-900 leading-snug mb-4">
  {contest?.title || "Elite Tournament"}
</h2>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-[2rem] flex flex-col items-center text-center">
                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Trophy size={10} /> Grand Prize
                    </p>
                    <p className="text-2xl font-black text-emerald-700 italic">₹{contest?.prizePool || 0}</p>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-[2rem] flex flex-col items-center text-center">
                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Wallet size={10} /> Entry Fee
                    </p>
                    <p className="text-2xl font-black text-indigo-700 italic">₹{contest?.entryFee || 0}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-2">
                  <div className="flex justify-between items-end px-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled Warriors</p>
                    <p className="text-xs font-black text-slate-900">{currentJoined} <span className="text-slate-300">/ {maxSpots}</span></p>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <StatBox icon={<Timer className="text-orange-500" size={18} />} label="Kickoff Time" value={getFormattedTime(contest?.startTime)} />
              <StatBox 
                icon={<Clock className="text-blue-500" size={18} />} 
                label="Duration" 
                value={`${contest?.duration || 15} Minutes`} 
              />
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
                <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                  <Flame size={18} className="text-orange-500 animate-pulse" fill="currentColor" /> Challenger Roster
                </h3>
                <span className="text-[9px] font-black bg-emerald-50 px-3 py-1 rounded-full text-emerald-600 border border-emerald-100 uppercase animate-pulse">Live</span>
              </div>
              
              <div className="divide-y divide-slate-50">
                {(contest?.participants || []).length > 0
  ? (contest?.participants || []).map((player, idx) => (
                  <motion.div 
                    key={player.userId || player._id || idx} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center justify-between p-4 transition-colors cursor-pointer ${player.isCurrentUser || (player._id === user?._id) ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                    onClick={() => navigate(`/profile/${player.userId || player._id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' : 
                        idx === 1 ? 'bg-slate-100 text-slate-600' : 
                        idx === 2 ? 'bg-orange-50 text-orange-700' : 'text-slate-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.username || 'Warrior'}`} 
                        className="w-10 h-10 rounded-xl bg-slate-100 border border-white shadow-sm" 
                        alt="avatar" 
                      />
                      <div>
                        <p className="text-sm font-black tracking-tight text-slate-800">
  {player.username || player.name || "Warrior"}
  {player._id === user?._id && " (YOU)"}
</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Authorized Participant</p>
                      </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-lg text-[10px] font-black text-indigo-600 border border-indigo-50 shadow-sm">
                      {/* 🔥 Using user context points for current user to avoid display sync lag */}
                      {player._id === user?._id ? (user?.rating || user?.points || user?.xp || 0) : (player.points || player.rating || 0)} XP
                    </div>
                  </motion.div>
                )) : (
                  <div className="py-16 text-center">
                    <p className="text-slate-300 font-black uppercase text-[10px] tracking-[0.5em] italic">Awaiting Warriors...</p>
                  </div>
                )}
              </div>
            </div>
          </main>

          <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-white/95 to-transparent z-[110]">
            <motion.button
              whileTap={!joining && !(isArenaFull && !joined) ? { scale: 0.96 } : {}}
              onClick={() => {
  console.log("BUTTON CLICKED 🔥", contest);

// ❌ REMOVE THIS LINE
// if (joining) return;

if (contest?.mode === "exam" && !joined) {
  console.log("EXAM MODE DETECTED");
  setShowInstructions(true); // 👉 OPEN INSTRUCTION PAGE
  return;
}

  console.log("NORMAL JOIN FLOW");
  handleAction();
}}
              disabled={joining || (isArenaFull && !joined)}
              className={`w-full max-w-md mx-auto py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all uppercase tracking-[0.2em] shadow-2xl border-b-4 active:border-b-0 ${
                isCompleted
                ? "bg-slate-900 text-slate-400 border-slate-700 shadow-xl" 
                : joined 
                  ? "bg-emerald-500 text-white border-emerald-700 shadow-emerald-200" 
                  : isArenaFull 
                    ? "bg-slate-300 text-slate-400 border-slate-400 cursor-not-allowed" 
                    : "bg-indigo-600 text-white border-indigo-800 shadow-indigo-200"
              }`}
            >
              {joining ? (
                <div className="w-6 h-6 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
              ) : isCompleted ? (
                <>VIEW STANDINGS <BarChart3 size={20} /></> 
              ) : joined ? (
                <>ENTER BATTLE <Swords size={20} fill="currentColor" /></>
              ) : isArenaFull ? (
                <>ARENA FULL <ShieldAlert size={20} /></>
              ) : (
                <>AUTHORIZE JOIN <Zap size={20} fill="currentColor" /></>
              )}
            </motion.button>
          </div>
{showLogin && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[999] p-4 font-sans">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white w-full max-w-md rounded-sm border border-gray-300 shadow-2xl overflow-hidden"
    >
      {/* Login Header - CBT Professional Style */}
      <div className="bg-[#1e40af] px-6 py-5 border-b-4 border-yellow-500 flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-sm shadow-inner">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-bold uppercase tracking-wider text-xs">Secure Authentication</h2>
          <p className="text-[10px] text-blue-100 opacity-70 uppercase tracking-tight">Identity verification required to proceed</p>
        </div>
      </div>

      <div className="p-8">
        {/* Assessment Context */}
        <div className="mb-8 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assessment ID</p>
          <code className="text-blue-700 font-mono bg-blue-50 px-4 py-1.5 rounded border border-blue-100 text-xs">
            {id?.slice(-12).toUpperCase() || "BATTLE-ARENA-2026"}
          </code>
        </div>

        <div className="space-y-5">
          {/* User ID Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase ml-1 tracking-wide">Candidate User ID</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Users className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter unique ID"
                value={loginUserId}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                onChange={(e) => setLoginUserId(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-600 uppercase ml-1 tracking-wide">Exam Passcode</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-sm focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all text-sm font-medium placeholder:text-gray-400"
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={async () => {
            try {
              await axiosInstance.post("/exam-auth/login", {
                userId: loginUserId,
                password: loginPassword,
                contestId: id
              });
              // ✅ JOIN CONTEST AFTER LOGIN
await axiosInstance.post(`/contest/${id}/join`);
              setShowLogin(false);
              setJoined(true);
              handleAction();
            } catch (err) {
              toast.error("Authentication Failed: Invalid Credentials");
            }
          }}
          className="w-full mt-8 bg-[#1e40af] hover:bg-blue-800 text-white font-bold py-4 rounded-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase text-[11px] tracking-[0.25em]"
        >
          Verify & Initialize
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Security Warning */}
        <div className="mt-8 flex items-center justify-center gap-2 opacity-40">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.1em]">
            Secure Session Monitoring Active
          </span>
        </div>
      </div>

      {/* Footer Info with Melo Branding */}
      <div className="bg-gray-100 px-8 py-4 border-t border-gray-200 flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Session: 2026-X</span>
          <div className="flex items-center gap-1">
             <span className="text-[8px] text-gray-400 font-bold uppercase italic">Powered by</span>
             <span className="text-[10px] text-indigo-600 font-black tracking-tight uppercase">Melo</span>
          </div>
        </div>
        
        <button 
          onClick={() => setShowLogin(false)}
          className="text-[10px] font-bold text-gray-400 uppercase hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5"
        >
          Cancel Request
        </button>
      </div>
    </motion.div>
  </div>
)}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatBox = ({ icon, label, value }) => (
  <div className="bg-white p-5 rounded-[2.5rem] border border-slate-200/60 flex flex-col items-center text-center shadow-sm active:bg-slate-50 transition-colors">
    <div className="w-10 h-10 rounded-2xl bg-slate-50 shadow-inner flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">{value}</p>
  </div>
);

const LoadingMatrix = () => (
  <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-10 overflow-hidden relative">
    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px]" />
    <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />

    <div className="relative mb-12 scale-110">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-28 h-28 border-[3px] border-white/5 border-t-indigo-500 border-r-indigo-500 rounded-full shadow-[0_0_30px_rgba(79,70,229,0.3)]" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute top-2 left-2 w-24 h-24 border-[3px] border-white/5 border-b-purple-500 border-l-purple-500 rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Zap size={28} className="text-indigo-400 animate-pulse" fill="currentColor" /></div>
    </div>

    <div className="text-center z-10">
      <h2 className="font-black text-white uppercase tracking-[0.5em] text-sm italic mb-4">Initializing <span className="text-indigo-400">Arena</span></h2>
      <div className="flex gap-2 justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        ))}
      </div>
    </div>
  </div>
);

export default ContestDetails;