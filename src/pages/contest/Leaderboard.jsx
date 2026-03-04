import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, ArrowLeft, Flame, Globe, Zap, Gamepad2, MapPin, 
  Star, Code, BookOpen, Brain, Microscope, 
  Calculator, Rocket, Heart, Palette, Languages, Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// Helper for dynamic icons based on Admin Panel categories
const getCategoryIcon = (name) => {
  const n = name.toUpperCase();
  if (n.includes('CODING') || n.includes('LIVE')) return <Code size={14} />;
  if (n.includes('MATH') || n.includes('LOGIC') || n.includes('REASONING')) return <Brain size={14} />;
  if (n.includes('SCIENCE') || n.includes('SPACE')) return <Microscope size={14} />;
  if (n.includes('GK') || n.includes('CONSTITUTION')) return <BookOpen size={14} />;
  if (n.includes('SPORTS') || n.includes('CRICKET')) return <Star size={14} />;
  if (n.includes('MUSIC') || n.includes('MOVIES')) return <Languages size={14} />;
  if (n.includes('ART')) return <Palette size={14} />;
  if (n.includes('GAMING')) return <Gamepad2 size={14} />;
  if (n.includes('BUSINESS') || n.includes('FINANCE')) return <Calculator size={14} />;
  if (n.includes('HEALTH')) return <Heart size={14} />;
  return <Zap size={14} />;
};

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 SYNCED CATEGORY STATE
  const [dynamicCategories, setDynamicCategories] = useState([{ id: 'all', label: 'Global', icon: <Globe size={14}/> }]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeTimeframe, setActiveTimeframe] = useState("global");
  
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const timeframes = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'nearby', label: 'Nearby', icon: <MapPin size={10} /> },
    { id: 'global', label: 'All Time' }
  ];

  /**
   * 🔥 SYNC 1: Fetch Live Categories from Admin Panel Signal
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        const cData = response?.data?.data || response?.data || [];
        
        if (Array.isArray(cData) && cData.length > 0) {
          const formatted = [
            { id: 'all', label: 'Global', icon: <Globe size={14}/> },
            ...cData.map(cat => ({
              id: cat.name, // 🔥 ID matches the exactly DB field from AdminPanel
              label: cat.name,
              icon: getCategoryIcon(cat.name)
            }))
          ];
          setDynamicCategories(formatted);
        }
      } catch (err) {
        console.error("Category Sync Failed", err);
      }
    };
    fetchCategories();
  }, []);

  /**
   * 🔥 SYNC 2: Fetch Filtered Leaderboard
   */
 useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        // 🔥 Use encodeURIComponent to handle categories with spaces like "MOVIES" or "GK"
        const endpoint = `/contest/leaderboard/${encodeURIComponent(activeCategory)}/${activeTimeframe}`;
        const response = await axiosInstance.get(endpoint);
        
        const leaderboardData = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data || [];
          
        setLeaders(leaderboardData);
      } catch (err) {
        console.error("Leaderboard Fetch Error:", err);
        setLeaders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [activeCategory, activeTimeframe]);

  const userRankIndex = leaders.findIndex(l => l._id === authUser?._id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : "N/A";
  const userScore = leaders[userRankIndex]?.score || leaders[userRankIndex]?.rating || 0;

  return (
    <div className="h-screen bg-[#050810] text-white flex flex-col overflow-hidden font-sans antialiased">
      
      {/* HEADER & FILTERS */}
      <div className="flex-none pt-6 px-6 pb-4 bg-gradient-to-b from-purple-900/40 to-transparent z-50 shadow-2xl border-b border-white/5">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white/5 border border-white/10 rounded-2xl active:scale-95 transition-all">
            <ArrowLeft size={20}/>
          </button>
          <div className="text-center">
            <h1 className="font-black italic text-2xl tracking-tighter uppercase leading-none">
              Arena <span className="text-purple-500">Elite</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Full Rankings</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
            <Flame size={20} className="text-orange-500 animate-pulse" />
          </div>
        </div>

        <div className="max-w-4xl mx-auto w-full overflow-x-auto no-scrollbar flex gap-3 pb-4">
          {dynamicCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border whitespace-nowrap transition-all text-[10px] font-black uppercase tracking-widest ${
                activeCategory === cat.id 
                ? "bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
                : "bg-white/5 border-white/10 text-slate-400"
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto w-full flex bg-slate-900/80 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          {timeframes.map((tf) => (
            <button 
              key={tf.id} 
              onClick={() => setActiveTimeframe(tf.id)} 
              className="relative flex-1 py-2.5 z-10 uppercase text-[10px] font-black tracking-widest outline-none flex items-center justify-center gap-1"
            >
              {activeTimeframe === tf.id && (
                <motion.div layoutId="timeTab" className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl" />
              )}
              <span className={`relative z-20 transition-colors ${activeTimeframe === tf.id ? 'text-purple-400' : 'text-slate-500'}`}>
                {tf.icon} {tf.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SCROLLABLE FULL LIST */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-44 no-scrollbar">
        <div className="max-w-2xl mx-auto w-full space-y-3">
          {loading ? (
             <div className="animate-pulse space-y-3">
               {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-20 bg-white/5 rounded-[1.8rem]" />)}
             </div>
          ) : leaders.length > 0 ? (
            leaders.map((player, index) => (
              <motion.div 
                key={player._id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-[1.8rem] flex items-center justify-between border transition-all ${
                    player._id === authUser?._id 
                    ? "bg-purple-600/30 border-purple-500 shadow-lg scale-[1.02]" 
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 font-black italic text-sm ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-orange-400' : 'text-slate-600'}`}>
                    #{index + 1}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 border ${index === 0 ? 'border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : 'border-white/10'}`}>
                    <img 
                        src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} 
                        alt="" 
                        className="w-full h-full object-cover" 
                    />
                  </div>
                  <div>
                    <span className="font-black text-xs uppercase tracking-tight block flex items-center gap-2">
                        {player.name}
                        {index === 0 && <Trophy size={12} className="text-yellow-400" />}
                    </span>
                    <span className="text-[8px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      {player.totalWins || 0} Victories • {player.location?.city || "Warrior"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-purple-400">{(player.score || player.rating || 0).toLocaleString()}</span>
                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    {activeCategory === 'all' ? 'Elo Rating' : 'Points'}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5 px-10">
              <Globe className="mx-auto text-slate-800 mb-4" size={48} />
              <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest leading-relaxed">
                {activeTimeframe === 'nearby' 
                  ? `No warriors from ${authUser?.location?.city || "your city"} found.` 
                  : "No rankings found for this protocol."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* USER STICKY FOOTER */}
      <AnimatePresence>
        {authUser && !loading && (
          <div className="fixed bottom-6 left-0 right-0 z-50 px-6 flex justify-center">
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }}
              className="w-full max-w-2xl p-4 bg-gradient-to-r from-purple-700 to-indigo-900 rounded-[2.2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-between border border-white/20 backdrop-blur-lg"
            >
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-white italic text-xl">
                   #{userRank}
                 </div>
                 <div>
                   <p className="text-[9px] font-black uppercase text-purple-200 tracking-widest mb-1">
                     {activeTimeframe === 'nearby' ? 'Local Rank' : 'Your Global Rank'}
                   </p>
                   <p className="font-black uppercase text-xs truncate w-32 md:w-48">{authUser.name}</p>
                 </div>
              </div>
              <div className="text-right">
                  <span className="font-black text-xl italic">{(userScore).toLocaleString()}</span>
                  <p className="text-[8px] font-black uppercase opacity-60">Level: {userRank <= 1 ? 'King' : userRank <= 10 ? 'Grandmaster' : 'Warrior'}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Leaderboard;