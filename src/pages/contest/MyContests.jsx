import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Timer, Trophy, PlayCircle, 
  CheckCircle2, ChevronRight, Calendar, Zap, Clock, Shield, Activity, BarChart3
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const MyContests = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [myBattles, setMyBattles] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = ["Upcoming", "Live", "Completed"];

  const fetchMyContests = useCallback(async () => {
    if (!user) return; 
    try {
      setLoading(true);
      const res = await axiosInstance.get("/contest/my-contests");
      
      const responseData = res?.data?.data || res?.data || res;
      setMyBattles(Array.isArray(responseData) ? responseData : []);
    } catch (err) {
      console.error("Arena Sync Failed:", err);
      toast.error("Failed to sync deployment logs.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchMyContests();
    }
  }, [fetchMyContests, authLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-10">
        <div className="relative mb-8">
          <div className="w-20 h-20 border-8 border-white/5 rounded-full" />
          <div className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0" />
        </div>
        <p className="font-black italic text-purple-400 text-[10px] uppercase tracking-[0.5em] animate-pulse">Syncing Enrolled Matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased pb-20">
      
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-2xl border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/dashboard')} 
            className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-black transition-all"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="font-black text-slate-900 text-lg uppercase tracking-tighter leading-none">Arena <span className="text-purple-600">History</span></h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Warrior Deployment Log</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Shield size={12} className="text-emerald-500" fill="currentColor" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Authorized</span>
        </div>
      </div>

      <main className="p-6 max-w-xl mx-auto space-y-8">
        
        <div className="flex bg-slate-100 p-1.5 rounded-[2rem] border border-slate-200 shadow-inner">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[1.5rem] shadow-lg shadow-purple-200"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingPulse />
            ) : myBattles.filter(b => b.status === activeTab.toUpperCase() || b.status === activeTab).length > 0 ? (
              myBattles.filter(b => b.status === activeTab.toUpperCase() || b.status === activeTab).map((battle) => (
                <BattleDeploymentCard key={battle._id} battle={battle} navigate={navigate} activeTab={activeTab} />
              ))
            ) : (
              <EmptyArenaState navigate={navigate} />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const BattleDeploymentCard = ({ battle, navigate, activeTab }) => {
  const isFinished = battle.isCompletedByUser;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      // 🔥 ALWAYS go to details or leaderboard
      onClick={() => isFinished ? navigate(`/contest-leaderboard/${battle._id}`) : navigate(`/contest/${battle._id}`)}
      className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden group cursor-pointer"
    >
      <div className="flex justify-between items-start mb-8">
        <div className="space-y-3">
          <span className="text-[9px] font-black text-purple-600 uppercase tracking-[0.3em] bg-purple-50 px-3 py-1.5 rounded-full border border-purple-100">
             {battle.category || "General"} Battle
          </span>
          <h3 className={`text-lg font-semibold leading-snug transition-colors ${
  isFinished ? 'text-slate-400' : 'text-slate-900 group-hover:text-purple-600'
}`}>
  {battle.title
  ?.toLowerCase()
  .replace(/\b\w/g, l => l.toUpperCase())}
</h3>
        </div>
        <div className="text-right">
            <p className="text-xs font-medium text-slate-500 mb-1">Victory Pot</p>
            <p className={`text-2xl font-black italic leading-none ${isFinished ? 'text-slate-300' : 'text-emerald-600'}`}>₹{battle.prizePool}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-2xl">
          <Calendar size={14} className="text-purple-500" />
          <span className="text-[10px] font-black uppercase text-slate-900 tracking-tighter">
            {new Date(battle.startTime).toLocaleString('en-IN', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
            })}
          </span>
        </div>
        
        {activeTab === "Upcoming" && (
          <CountdownTimer startTime={battle.startTime} />
        )}

        {(activeTab === "Live" || battle.status === "LIVE") && (
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              // 🔥 ALWAYS go to details or leaderboard
              if (isFinished) {
                navigate(`/contest-leaderboard/${battle._id}`);
              } else {
                navigate(`/contest/${battle._id}`);
              }
            }}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all ${
              isFinished 
                ? "bg-slate-800 text-slate-400 shadow-slate-200" 
                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-200 animate-pulse"
            } active:scale-95`}
          >
            {isFinished ? (
              <>View Standings <BarChart3 size={14}/></>
            ) : (
              <><Zap size={16} fill="white" /> Enter Arena</>
            )}
          </button>
        )}

        {(activeTab === "Completed" || battle.status === "COMPLETED") && (
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100">
            <CheckCircle2 size={16} /> Analysis Archived
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-black uppercase text-purple-400 tracking-[0.4em]">View Deployment Context <ChevronRight size={10} className="inline"/></span>
      </div>
    </motion.div>
  );
};

const CountdownTimer = ({ startTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(startTime) - +new Date();
    if (difference <= 0) return "Starting Now";
    
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    return `${hours}h ${minutes}m Left`;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 60000);
    return () => clearInterval(timer);
  }, [startTime]);

  return (
    <div className="flex items-center gap-2 text-orange-500 font-black text-[10px] uppercase tracking-widest italic animate-pulse">
      <Clock size={14} /> {timeLeft}
    </div>
  );
};

const LoadingPulse = () => (
  <div className="space-y-6 py-10">
    {[1, 2].map(i => (
      <div key={i} className="bg-white h-56 rounded-[3rem] animate-pulse border border-slate-100 flex flex-col p-8 justify-between">
         <div className="w-1/2 h-6 bg-slate-100 rounded-full" />
         <div className="w-full h-12 bg-slate-50 rounded-2xl" />
      </div>
    ))}
  </div>
);

const EmptyArenaState = ({ navigate }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    animate={{ opacity: 1 }}
    className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-slate-100"
  >
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
        <Trophy className="text-slate-200" size={36} />
      </div>
      <p className="text-slate-400 font-black text-[11px] uppercase tracking-[0.4em] mb-8 italic">
        No active deployments detected
      </p>
      <button 
       onClick={() => navigate('/dashboard')} 
       className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-black transition-all active:scale-95"
      >
        Global Arena Lobby ↗
      </button>
  </motion.div>
);

export default MyContests;