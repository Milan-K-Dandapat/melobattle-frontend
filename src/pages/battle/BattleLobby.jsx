import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, ShieldCheck, Zap, Swords, Activity, 
  Wifi, Cpu, Fingerprint, Lock, Calendar, ArrowLeft, Trophy, Coins, Users
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";

const BattleLobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ h: "00", m: "00", s: "00" });
  const [status, setStatus] = useState("Establishing Neural Link...");

  const contestRef = useRef(null);

  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 5
    }));
  }, []);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await axiosInstance.get(`/contest/${id}`);
        const data = res?.data?.data || res?.data || res;
        setContest(data);
        contestRef.current = data; 
      } catch (err) {
        console.error("Lobby Sync Error:", err);
        navigate('/dashboard');
      }
    };
    if (id) fetchContest();
  }, [id, navigate]);

  useEffect(() => {
    if (contest) {
      contestRef.current = contest;
    }
  }, [contest]);

  useEffect(() => {
    if (!contest) return;

    let isTriggered = false; 

    const timer = setInterval(async () => {
      if (isTriggered) return;

      const now = new Date().getTime();
      const startTimeValue = contestRef.current?.startTime || contest.startTime;

if (!startTimeValue) {
  setStatus("INVALID START TIME");
  return;
}
let start;

if (
  typeof startTimeValue === "string" &&
  !startTimeValue.endsWith("Z") &&
  !startTimeValue.includes("+")
) {
  start = new Date(startTimeValue + "Z").getTime();
} else {
  start = new Date(startTimeValue).getTime();
}

if (isNaN(start)) {
  console.error("Invalid startTime:", startTimeValue);
  setStatus("INVALID START TIME");
  return;
}
      const diff = start - now;

      if (diff < -5000) {
  setStatus("BATTLE TERMINATED");
  setTimeout(() => {
    navigate(`/contest-leaderboard/${id}`, { replace: true });
  }, 1500);
  return;
}
      if (diff <= 0) {
        isTriggered = true; 
        clearInterval(timer);
        setStatus("FINALIZING ARENA SYNC...");

        try {
          const response = await axiosInstance.post("/contest/start-battle", { 
            contestId: id 
          });

          const resData = response?.data || response;

          if (resData && (resData.success || resData.status === "LIVE")) {
            setStatus("ARENA AUTHORIZED!");
            toast.success("COMBAT PROTOCOL INITIATED", { icon: '⚔️' });
            
            setTimeout(() => {
              const latestCategory = String(contestRef.current?.category || contest?.category || "").trim().toUpperCase();
              
              if (latestCategory === "LIVE CODING SOLVE") {
                navigate(`/live-compiler/${id}`, { replace: true });
              } else {
                navigate(`/battle/${id}`, { replace: true });
              }
            }, 1200);

          } else {
            throw new Error(resData?.message || "Unauthorized Entry");
          }
        } catch (error) {
  console.error("Battle Initiation Error:", error);

  const msg = error?.response?.data?.message || error.message;

  if (msg.includes("ended")) {
    setStatus("BATTLE TERMINATED");
    toast.error("Battle already ended");

    setTimeout(() => {
      navigate(`/contest-leaderboard/${id}`, { replace: true });
    }, 1500);
  } else {
    setStatus("SYNC FAILURE");
    toast.error(msg || "Arena Sync Failed");

    setTimeout(() => navigate('/dashboard'), 2000);
  }
}
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);

        const totalHours = days * 24 + h;

        setTimeLeft({
          h: String(totalHours).padStart(2, '0'),
          m: String(m).padStart(2, '0'),
          s: String(s).padStart(2, '0')
        });

        if (diff < 10000) setStatus("Finalizing Neural Link...");
        else if (diff < 30000) setStatus("Calibrating Arena Matrix...");
        else setStatus("Awaiting Battle Commencement...");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest, id, navigate]);

  const schedule = useMemo(() => {
    if (!contest?.startTime) return { date: "---", time: "---" };
  let dt;

if (
  typeof contest.startTime === "string" &&
  !contest.startTime.endsWith("Z") &&
  !contest.startTime.includes("+")
) {
  dt = new Date(contest.startTime + "Z");
} else {
  dt = new Date(contest.startTime);
}

if (isNaN(dt.getTime())) {
  return { date: "INVALID", time: "INVALID" };
}
    return {
      date: dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };
  }, [contest]);

  /* =========================================
      🔥 DYNAMIC MULTI-PLAYER PAYOUT ENGINE
      Calculates prizes for ANY number of contestants.
  ========================================= */
  const dynamicPrizeBreakdown = useMemo(() => {
    if (!contest || !contest.prizePool || !contest.maxParticipants) return [];
    
    const pool = Number(contest.prizePool);
    const totalSlots = contest.maxParticipants;
    
    // 1. Determine number of winners (Default 60% of players win)
    const winnerCount = Math.ceil(totalSlots * 0.6);
    
    // 2. Standard 2-Player Logic
    if (totalSlots === 2) {
      return [
        { rank: 1, prize: Math.floor(pool * 0.7), color: "text-amber-400" },
        { rank: 2, prize: Math.floor(pool * 0.3), color: "text-slate-400" }
      ];
    }
    
    // 3. Multi-Player Logic (Weighted distribution)
    const breakdown = [];
    let totalWeight = 0;
    for (let i = winnerCount; i >= 1; i--) totalWeight += i;

    for (let r = 1; r <= winnerCount; r++) {
      const weight = winnerCount - (r - 1);
      const prize = Math.floor((weight / totalWeight) * pool);
      
      let color = "text-slate-400";
      if (r === 1) color = "text-amber-400";
      else if (r === 2) color = "text-slate-300";
      else if (r === 3) color = "text-orange-400";

      breakdown.push({ rank: r, prize, color });
    }

    return breakdown;
  }, [contest]);

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden relative">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <button onClick={() => navigate(-1)} className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90 shadow-xl">
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
            className="absolute bg-purple-500 rounded-full blur-[1px]"
            style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md pt-12 md:pt-0">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="relative mb-4 md:mb-6">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="w-16 h-16 md:w-20 md:h-20 border border-white/5 border-t-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Lock className="w-5 h-5 md:w-6 md:h-6 text-purple-400 animate-pulse" />
              </div>
          </div>
          <h2 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-purple-500 mb-2">Neural Link Active</h2>
          <div className="px-4 md:px-5 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-none">{contest?.title || "ARENA READY"}</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center mb-6 md:mb-8">
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-white/5 shadow-sm">
              <Calendar size={12} className="text-purple-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-slate-400">{schedule.date}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 bg-white/5 px-3 md:px-4 py-1.5 md:py-2 rounded-xl md:rounded-2xl border border-white/5 shadow-sm">
              <Clock size={12} className="text-indigo-400" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter text-slate-400">{schedule.time}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-10 mb-6 md:mb-8 shadow-2xl relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 px-4 md:px-5 py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em] shadow-lg whitespace-nowrap">Time to combat</div>
          <div className="flex justify-center items-baseline gap-1.5 md:gap-2">
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white italic leading-none">{timeLeft.h}</span>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase mt-1 md:mt-2 tracking-[0.2em]">Hrs</span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-500 mb-2 md:mb-4 animate-pulse">:</span>
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white italic leading-none">{timeLeft.m}</span>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase mt-1 md:mt-2 tracking-[0.2em]">Mins</span>
            </div>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-purple-500 mb-2 md:mb-4 animate-pulse">:</span>
            <div className="flex flex-col">
              <span className="text-4xl sm:text-5xl md:text-6xl font-black tabular-nums tracking-tighter text-white italic leading-none">{timeLeft.s}</span>
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase mt-1 md:mt-2 tracking-[0.2em]">Secs</span>
            </div>
          </div>
        </div>

        {/* Dynamic Payout Table */}
        <div className="bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-6 mb-6 md:mb-8 overflow-hidden">
          <div className="flex items-center justify-between mb-4 md:mb-5 px-1 md:px-2">
            <div className="flex items-center gap-1.5 md:gap-2">
               <Trophy size={14} className="text-amber-400" />
               <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-300">Prize Board</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-purple-500/10 px-2 md:px-3 py-1 rounded-lg border border-purple-500/20">
               <Users size={10} className="text-purple-400" />
               <span className="text-[8px] md:text-[9px] font-black text-purple-400 uppercase tracking-tighter">{contest?.maxParticipants} Warriors</span>
            </div>
          </div>
          
          <div className="space-y-2 md:space-y-2.5 max-h-[200px] md:max-h-[220px] overflow-y-auto no-scrollbar pr-1">
            {dynamicPrizeBreakdown.map((p) => (
              <motion.div 
                key={p.rank}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/5"
              >
                <div className="flex items-center gap-2 md:gap-4">
                  <span className={`text-xs md:text-sm font-black italic w-5 md:w-6 ${p.color}`}>#{p.rank < 10 ? `0${p.rank}` : p.rank}</span>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-400">Winning Reward</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <Coins size={12} className="text-emerald-400 md:w-3.5 md:h-3.5" />
                  <span className="text-lg md:text-xl font-black italic tracking-tighter text-white">₹{p.prize}</span>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 md:mt-5 pt-3 md:pt-4 border-t border-white/5 flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest">Winnings decided by Skill & Performance</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8 md:mb-12 px-1 md:px-2">
          <StatusCard icon={<Wifi size={14}/>} label="Signal" value="Stable" color="text-emerald-500" />
          <StatusCard icon={<Cpu size={14}/>} label="Arena" value="Locked" color="text-indigo-500" />
          <StatusCard icon={<Fingerprint size={14}/>} label="Auth" value="Verified" color="text-purple-500" />
        </div>

        <div className="space-y-3 md:space-y-4 pb-12 md:pb-0">
          <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-500 italic animate-pulse">{status}</p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-1/2 h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
          </div>
        </div>
      </motion.div>

      <footer className="fixed bottom-4 md:bottom-10 left-0 right-0 px-4 md:px-10 flex flex-col md:flex-row justify-center md:justify-between items-center gap-1 md:gap-0 opacity-20">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-purple-500" />
          <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Protocol Instance 2.6.0</span>
        </div>
        <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest italic">Connection Encrypted</span>
      </footer>
    </div>
  );
};

const StatusCard = ({ icon, label, value, color }) => (
  <div className="bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-2.5 sm:p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 shadow-sm transition-all hover:bg-white/10 active:scale-95">
    <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl bg-white/5 ${color}`}>{icon}</div>
    <div className="text-center">
      <p className="text-[6px] md:text-[7px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={`text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase italic leading-none ${color}`}>{value}</p>
    </div>
  </div>
);

export default BattleLobby;