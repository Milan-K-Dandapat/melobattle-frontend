import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Wallet, Trophy, Flame, Menu, LayoutDashboard, Gamepad2, User,
  History, TrendingUp, PlusCircle, Search, Gift, Star, Zap, ChevronRight, 
  Users, Timer, BookOpen, Brain, Microscope, Percent, CreditCard, ArrowUpRight, LogOut, X,
  ShieldCheck, Activity, AlertCircle, Clock, Calendar, Lock, BarChart3, Home, Copy, Filter,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../api/axios";
import MusicPlayer from "../../components/MusicPlayer";
import socket from "../../socket"; 
import { toast } from "react-hot-toast";

// Helper for dynamic icons
const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('math') || n.includes('logic')) return <Brain size={16} />;
  if (n.includes('science') || n.includes('tech')) return <Microscope size={16} />;
  if (n.includes('gk') || n.includes('language')) return <BookOpen size={16} />;
  if (n.includes('sport') || n.includes('cricket')) return <Star size={16} />;
  if (n.includes('gaming') || n.includes('coding')) return <Gamepad2 size={16} />;
  return <Zap size={16} />;
};

const Dashboard = () => {
  const [open, setOpen] = useState(false); 
  const [activeTab, setActiveTab] = useState("All");
  const [contests, setContests] = useState([]);
  const [loadingContests, setLoadingContests] = useState(true);
  const isFetching = useRef(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false); 
  
  // 🔥 SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearch, setCategorySearch] = useState(""); // NEW: For domains/sub-domains
  
  // 🔥 DYNAMIC CATEGORIES STATE
  const [dynamicCategories, setDynamicCategories] = useState([{ name: "All", icon: <Gamepad2 size={16} /> }]);

  // 🔥 PWA INSTALL STATE
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const { user, logout, loading: authLoading, refreshUser } = useAuth(); // 🔥 refreshUser added for balance sync
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {

  if (isFetching.current) return;   // 🔒 stop duplicate requests
  isFetching.current = true;

  try {
      if (contests.length === 0) setLoadingContests(true); 
      
     const safeGet = async (url) => {
  try {
    return await axiosInstance.get(url);
  } catch (err) {

    // 🔥 Ignore cancelled axios requests
    if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
      return null;
    }

    return err?.response || null;
  }
};

      const [contestResponse, categoryResponse] = await Promise.all([
        safeGet("/contest"),
        safeGet("/categories")
      ]);

      if (!contestResponse || !categoryResponse) {
  return;
}

      // 🔥 BULLETPROOF BATTLE EXTRACTION (Matches AdminPanel)
      let battleArray = [];
      const rawBattles = contestResponse?.data || contestResponse;
      
      if (Array.isArray(rawBattles)) {
          battleArray = rawBattles;
      } else if (rawBattles?.data && Array.isArray(rawBattles.data)) {
          battleArray = rawBattles.data;
      } else if (rawBattles?.contests && Array.isArray(rawBattles.contests)) {
          battleArray = rawBattles.contests;
      } else if (contestResponse?.data?.data && Array.isArray(contestResponse.data.data)) {
          battleArray = contestResponse.data.data;
      }
      setContests(battleArray);

      // 🔥 Handle Dynamic Categories
      const catData = categoryResponse?.data?.data || categoryResponse?.data || [];
      if (Array.isArray(catData) && catData.length > 0) {
        const formattedCats = [
          { name: "All", icon: <Gamepad2 size={16} /> },
          ...catData.map(c => ({
            name: c.name,
            icon: getCategoryIcon(c.name)
          }))
        ];
        setDynamicCategories(formattedCats);
      }

    } catch (err) {
      console.error("Dashboard Sync Failed:", err);
    } finally {
  setLoadingContests(false);
  isFetching.current = false; // 🔓 allow next request
}
  }, [contests.length]);

  useEffect(() => {
    if (user && contests.length === 0 && !isFetching.current) {
  fetchDashboardData();
}

    // 🔥 Sync balance on dashboard mount to reflect recent deposits
    if (user && refreshUser) {
      refreshUser();
    }

    // 🔥 PWA Install Listener
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

  let interval;

if (socket) {

  const handleNewContest = (newContest) => {
    setContests((prev) => {
      const exists = prev.find((c) => c._id === newContest._id);
      if (exists) return prev;
      return [newContest, ...prev];
    });
  };

  const handlePlayerUpdate = ({ contestId, joinedCount }) => {
    setContests(prev =>
      prev.map(c =>
        c._id === contestId ? { ...c, joinedCount } : c
      )
    );
  };

const handleContestFinalized = () => {

  if (refreshUser) refreshUser();

  // 🔥 force refresh contests so completed battle updates
  setContests([]);
  fetchDashboardData();
};

 const handleBattleStarted = () => {
  fetchDashboardData();
};

  socket.off("NEW_CONTEST_DEPLOYED").on("NEW_CONTEST_DEPLOYED", handleNewContest);
  socket.off("PLAYER_JOINED_UPDATE").on("PLAYER_JOINED_UPDATE", handlePlayerUpdate);
  socket.off("CONTEST_FINALIZED").on("CONTEST_FINALIZED", handleContestFinalized);
  socket.off("BATTLE_STARTED").on("BATTLE_STARTED", handleBattleStarted);
}

return () => {

  if (socket) {
    socket.off("NEW_CONTEST_DEPLOYED");
    socket.off("PLAYER_JOINED_UPDATE");
    socket.off("CONTEST_FINALIZED");
    socket.off("BATTLE_STARTED");
  }

  window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
};


  }, [user, fetchDashboardData, refreshUser]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.error("Install app from your browser menu!");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const filteredContests = useMemo(() => {
    const now = Date.now();
    const THREE_HOURS = 3 * 60 * 60 * 1000;

    const filtered = contests.filter(c => {
      // Safely parse start time, ignoring badly formatted old test data
     let startTs = null;
let endTime = null;

// 🔥 Instant battles never expire
if (!c.isInstantBattle) {
  startTs = new Date(c.startTime).getTime();

  if (isNaN(startTs)) return false;

  endTime = startTs + ((c.duration || 15) * 60 * 1000);

  // remove battles ended long ago
  if (now > endTime + THREE_HOURS) return false;
}
      

      // 🔥 GENERAL SEARCH FILTER: Title or Battle Code
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const titleMatch = c.title?.toLowerCase().includes(q);
        const codeMatch = c.battleCode?.toLowerCase().includes(q);
        if (!titleMatch && !codeMatch) return false;
      }

      // 🔥 CATEGORY/SUB-CATEGORY SEARCH FILTER
      if (categorySearch) {
        const cq = categorySearch.toLowerCase();
        const catMatch = c.category?.toLowerCase().includes(cq);
        const subCatMatch = c.subCategory?.toLowerCase().includes(cq);
        if (!catMatch && !subCatMatch) return false;
      }

      // TAB FILTER
      if (activeTab !== "All") {
        const dbCategory = c.category ? String(c.category).toLowerCase().trim() : "global";
        const selectedTab = activeTab.toLowerCase().trim();
        if (dbCategory !== selectedTab) return false;
      }

      return true;
    });

   return filtered.sort((a, b) => {

  // 🔥 Always open battles always appear first
  if (a.isInstantBattle && !b.isInstantBattle) return -1;
  if (!a.isInstantBattle && b.isInstantBattle) return 1;

  const aStart = new Date(a.startTime).getTime();
  const bStart = new Date(b.startTime).getTime();

  const aEnd = aStart + ((a.duration || 15) * 60 * 1000);
  const bEnd = bStart + ((b.duration || 15) * 60 * 1000);

  const aIsClosed = Date.now() > aEnd;
  const bIsClosed = Date.now() > bEnd;

  if (aIsClosed && !bIsClosed) return 1;
  if (!aIsClosed && bIsClosed) return -1;

  return aStart - bStart;
});
  }, [contests, activeTab, searchQuery, categorySearch]); 

  const handlePlayNow = () => {
    if (filteredContests.length > 0) {
      const topContest = filteredContests[0];
      const now = Date.now();
      const contestEnd = new Date(topContest.startTime).getTime() + ((topContest.duration || 15) * 60 * 1000);
      
      if (topContest.isCompletedByUser || now > contestEnd) {
        navigate(`/contest-leaderboard/${topContest._id}`);
      } else {
        // 🔥 ALWAYS GO TO CONTEST DETAILS (No bypass!)
        navigate(`/contest/${topContest._id}`);
      }
    } else {
      navigate("/dashboard");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-slate-400 font-black tracking-widest uppercase text-[10px]">Entering Matrix...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex overflow-x-hidden font-sans antialiased">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${open ? "w-72" : "-translate-x-full md:translate-x-0 md:w-24"}`}>
        <div className="flex flex-col h-full">
          <div className="h-16 md:h-20 flex items-center px-4 md:px-6 border-b border-slate-100 justify-between">
            <div className="flex items-center">
              <div className="bg-purple-600 p-1.5 md:p-2 rounded-xl shadow-lg">
                <Zap className="text-white w-5 h-5 md:w-6 md:h-6" fill="white" />
              </div>
              {open && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 font-black text-xl md:text-2xl tracking-tighter text-purple-700 uppercase">
                  MELO<span className="text-slate-800">BATTLE</span>
                </motion.span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="md:hidden p-2 text-slate-400">
              <X size={20}/>
            </button>
          </div>

          <nav className="flex-1 p-3 md:p-4 space-y-1.5 overflow-y-auto">
            <SidebarItem icon={<LayoutDashboard size={20}/>} label="Lobby" active={activeTab === "All"} isOpen={open} onClick={() => navigate("/dashboard")} />
            <SidebarItem icon={<Trophy size={20}/>} label="My Contests" isOpen={open} onClick={() => navigate("/my-contests")} />
            <SidebarItem icon={<History size={20}/>} label="Earnings" isOpen={open} onClick={() => navigate("/wallet-history")} />
            <SidebarItem icon={<TrendingUp size={20}/>} label="Leaderboard" isOpen={open} onClick={() => navigate("/leaderboard")} />
            
            <div className="py-2">
              <MusicPlayer variant="sidebar" isOpen={open} />
            </div>

            <div className="my-4 border-t border-slate-100" />
            <SidebarItem icon={<User size={20}/>} label="Profile" isOpen={open} onClick={() => navigate("/profile")} />
            <SidebarItem icon={<LogOut size={20}/>} label="Logout" isOpen={open} onClick={logout} />
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <div className={`flex flex-col ${!open && 'items-center'}`}>
                <div className="flex justify-between text-[10px] font-black text-slate-400 mb-2">
                   {open && <span className="tracking-widest uppercase">Skill Level</span>}
                   {open && <span className="text-purple-600">{user?.rating || 1000}</span>}
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                   <motion.div initial={{ width: 0 }} animate={{ width: "60%" }} className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full" />
                </div>
              </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 pb-24 md:pb-0">
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 h-16 md:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setOpen(!open)} className="p-2 md:p-2.5 hover:bg-slate-100 rounded-xl transition-all">
              <Menu className="w-5 h-5 md:w-[22px] md:h-[22px] text-slate-600" />
            </button>
            <div className="relative hidden lg:block w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Battle Code or Name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-transparent rounded-xl focus:bg-white outline-none text-sm font-medium transition-all" 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
              {/* 🔥 DOWNLOAD BUTTON: Near Add Cash in Mobile only */}
              <button 
                onClick={handleInstallClick} 
                className="sm:hidden flex items-center justify-center p-2.5 bg-slate-100 text-slate-900 rounded-[14px] border border-slate-200 shadow-sm transition-all active:scale-90"
                title="Download App"
              >
                <Download size={18} />
              </button>

              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Live Balance</span>
                <span className="font-black text-xl leading-none text-slate-900 tracking-tight">₹{user?.walletBalance?.toLocaleString() || "0"}</span>
              </div>
              <button onClick={() => navigate('/deposit')} className="flex items-center gap-1.5 md:gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 md:px-5 md:py-3 rounded-[14px] md:rounded-2xl font-black shadow-lg transition-all active:scale-95 group">
                <PlusCircle className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[10px] md:text-base tracking-wide">Add Cash</span>
              </button>
          </div>
        </header>

        <div className="p-3 sm:p-4 md:p-8 max-w-[1400px] mx-auto w-full space-y-6 md:space-y-8">
          <div className="bg-amber-50 border border-amber-100 py-2 sm:py-3 px-3 sm:px-5 rounded-xl sm:rounded-2xl flex items-center gap-2 sm:gap-3 shadow-sm overflow-hidden">
             <div className="shrink-0 flex items-center gap-1.5 sm:gap-2 text-amber-600 font-black text-[9px] sm:text-xs uppercase bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-100 shadow-sm">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" /> Live Arena:
             </div>
             <marquee className="text-[10px] sm:text-sm font-bold text-amber-800/80 tracking-tight">
                {user?.name} joined the arena • New ₹25k Mega Contests starting soon • Fair play protocols active...
             </marquee>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            <StatCard icon={<Trophy className="text-amber-500 w-5 h-5 md:w-6 md:h-6"/>} label="Total Wins" value={user?.totalWins || 0} subValue="Victories" color="amber" />
            <StatCard icon={<TrendingUp className="text-emerald-500 w-5 h-5 md:w-6 md:h-6"/>} label="Withdrawn" value={`₹${user?.totalWithdrawn || 0}`} subValue="Payouts" color="emerald" />
            <StatCard icon={<Percent className="text-blue-500 w-5 h-5 md:w-6 md:h-6"/>} label="Skill Rank" value={user?.rating || 1000} subValue="Elo Rating" color="blue" />
            <StatCard icon={<Users className="text-purple-500 w-5 h-5 md:w-6 md:h-6"/>} label="Battles" value={user?.totalMatches || 0} subValue="Matches" color="purple" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
            <div className="xl:col-span-8 space-y-6 md:space-y-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-[#16123F] to-[#2D1B69] overflow-hidden shadow-2xl shadow-indigo-100">
                <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                  <div className="text-center md:text-left w-full">
                    <span className="bg-amber-400 text-amber-950 text-[9px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest inline-block shadow-lg">Mega Contest</span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-4 md:mt-6 leading-tight uppercase tracking-tighter">Premier <br/><span className="text-purple-400">Battle League</span></h2>
                    <p className="text-slate-300 mt-2 md:mt-4 text-sm md:text-lg font-medium">Win <span className="text-white font-black underline decoration-purple-500 underline-offset-4">Big Rewards</span> today</p>
                    <button onClick={handlePlayNow} className="mt-6 md:mt-8 bg-white text-[#16123F] font-black px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl hover:bg-purple-50 transition-all flex items-center justify-center md:justify-start gap-2 group shadow-xl mx-auto md:mx-0 w-full md:w-auto">
                        PLAY NOW <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                  <Trophy size={160} className="text-amber-400 opacity-80 hidden md:block drop-shadow-[0_0_30px_rgba(251,191,36,0.3)] shrink-0" />
                </div>
              </motion.div>

              {/* 🔥 NEW: DOMAIN / SUB-DOMAIN SEARCH BAR */}
              <div className="flex items-center gap-3 md:gap-4 bg-white p-2 pl-3 md:pl-4 rounded-xl md:rounded-2xl shadow-sm border border-slate-100">
                <Filter className="w-4 h-4 md:w-[18px] md:h-[18px] text-purple-500 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Filter specifically by Topic (e.g. React, Olympics, HTML...)" 
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-transparent border-none outline-none text-xs md:text-sm font-bold placeholder-slate-400 text-slate-800 uppercase tracking-widest"
                />
                {categorySearch && (
                  <button onClick={() => setCategorySearch("")} className="p-1.5 md:p-2 hover:bg-slate-100 rounded-lg md:rounded-xl text-slate-400 transition-colors shrink-0">
                    <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </button>
                )}
              </div>

              {/* 🔥 DYNAMIC CATEGORY TABS FROM BACKEND */}
              <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-4 no-scrollbar">
                {dynamicCategories.map((cat) => (
                  <button key={cat.name} onClick={() => setActiveTab(cat.name)} className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2.5 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === cat.name ? "bg-purple-600 text-white shadow-lg scale-105" : "bg-white text-slate-500 border border-slate-100 hover:text-purple-600"}`}>
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-6 md:pb-20">
                {loadingContests ? (
                  <div className="col-span-1 md:col-span-2 text-center py-12 md:py-20 animate-pulse text-slate-400 font-bold uppercase text-[10px] md:text-xs tracking-widest">Gathering live battles...</div>
                ) : filteredContests.length > 0 ? (
                  filteredContests?.map((c) => (
                    <BattleCard
  key={c._id} 
  id={c._id} 
  navigate={navigate} 
  title={c.title}
  prize={`₹${c.prizePool}`} 
  entry={c.entryFee === 0 ? "FREE" : `₹${c.entryFee}`} 
  spots={`${c.joinedCount}/${c.maxParticipants}`}
  isJoined={c.isJoined}
  isCompletedByUser={c.isCompletedByUser} 
  bannerImage={c.bannerImage}
  startTime={c.startTime} 
  duration={c.duration} 
  category={c.category} 
  subCategory={c.subCategory} 
  isFilling={c.joinedCount > ((c.maxParticipants || 1) * 0.8)}
  battleCode={c.battleCode}
  isInstantBattle={c.isInstantBattle}   // ✅ ADD THIS LINE
/>
                  ))
                ) : (
                  <div className="col-span-1 md:col-span-2 bg-white rounded-3xl md:rounded-[2.5rem] p-10 md:p-16 text-center border-2 border-dashed border-slate-200 text-slate-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest">
                    No active battles match your search or category. Try another!
                  </div>
                )}
              </div>
            </div>
            
            {/* 🔥 Desktop Sidebar: Hidden on Mobile Viewport */}
            <div className="hidden xl:col-span-4 xl:block space-y-6">
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
                <div className="absolute -right-4 -top-4 text-slate-50 group-hover:text-purple-50 transition-colors">
                  <Wallet size={120} />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                    <CreditCard className="text-purple-600" size={18} /> My Wallet
                  </h3>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</span>
                      <span className="font-black text-xl text-black">₹{user?.walletBalance?.toLocaleString() || 0}</span>
                  </div>
                  <button onClick={() => navigate("/withdraw")} className="w-full mt-4 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-slate-200">
                    Withdraw Now ↗
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <h3 className="font-black text-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                  <History className="text-purple-500" size={16} /> Arena History
                </h3>
                <div className="space-y-3">
                  <ActivityItem title="Welcome Bonus" result="+₹50" time="Account Start" isWin />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 🔥 MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 sm:px-6 py-2 sm:py-3 z-[100] flex justify-between items-center shadow-[0_-10px_25px_rgba(0,0,0,0.05)]">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-purple-600">
            <Home className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">Home</span>
          </button>
          <button onClick={() => navigate('/my-contests')} className="flex flex-col items-center gap-1 text-slate-400">
            <Gamepad2 className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">Battles</span>
          </button>
          
          <div className="relative -mt-8 sm:-mt-10">
            <button 
              onClick={() => setIsWalletOpen(true)}
              className="bg-purple-600 p-3.5 sm:p-4 rounded-full text-white shadow-2xl shadow-purple-300 border-[3px] sm:border-4 border-white transition-transform active:scale-90"
            >
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
            </button>
            <span className="absolute -bottom-3 sm:-bottom-4 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-black uppercase text-purple-600 tracking-tighter">Wallet</span>
          </div>

          <button onClick={() => navigate('/leaderboard')} className="flex flex-col items-center gap-1 text-slate-400">
            <Trophy className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">Rank</span>
          </button>
          <button onClick={() => navigate('/profile')} className="flex flex-col items-center gap-1 text-slate-400">
            <User className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter">Profile</span>
          </button>
      </div>

      {/* 🔥 MOBILE WALLET BOTTOM SHEET */}
      <AnimatePresence>
        {isWalletOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsWalletOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2rem] sm:rounded-t-[2.5rem] p-6 sm:p-8 z-[120] shadow-2xl border-t border-slate-100 md:hidden"
            >
              <div className="w-10 sm:w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:mb-8" />
              <h3 className="font-black text-black uppercase text-[10px] sm:text-xs tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                <CreditCard className="text-purple-600 w-4 h-4 sm:w-[18px] sm:h-[18px]" /> MY WALLET
              </h3>
              
              <div className="bg-slate-50 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                   <div>
                     <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available</p>
                     <p className="text-2xl sm:text-3xl font-black text-black tracking-tighter">₹{user?.walletBalance?.toLocaleString() || 0}</p>
                   </div>
                   <div className="bg-white p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100">
                     <Zap className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" />
                   </div>
                </div>
              </div>

              <button 
                onClick={() => { navigate("/withdraw"); setIsWalletOpen(false); }} 
                className="w-full py-4 sm:py-5 bg-black text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl flex items-center justify-center gap-2 sm:gap-3"
              >
                WITHDRAW NOW <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              
              <button onClick={() => setIsWalletOpen(false)} className="w-full mt-3 sm:mt-4 py-3 sm:py-4 text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-widest">Close</button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */

const SidebarItem = ({ icon, label, active = false, isOpen, onClick }) => (
  <div onClick={onClick} className={`flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all duration-300 ${active ? "bg-purple-600 text-white shadow-xl scale-105" : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"}`}>
    <div className={`${isOpen ? "mr-3 md:mr-4" : "mx-auto"}`}>{icon}</div>
    {isOpen && <span className="font-black text-[10px] md:text-[11px] uppercase tracking-widest">{label}</span>}
  </div>
);

const StatCard = ({ icon, label, value, subValue, color }) => {
  const colors = { amber: "bg-amber-50 text-amber-600", emerald: "bg-emerald-50 text-emerald-600", blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <div className="bg-white p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center hover:scale-105 transition-transform">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 ${colors[color]}`}>{icon}</div>
      <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
      <h4 className="text-xl md:text-2xl font-black text-black tracking-tighter leading-none">{value}</h4>
      <p className="text-[8px] md:text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{subValue}</p>
    </div>
  );
};

const BattleCard = memo(({ id, navigate, title, prize, entry, spots, startTime, isFilling, category, subCategory, isJoined, isCompletedByUser, bannerImage, duration, battleCode, isInstantBattle }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  
  const spotArray = (spots || "0/1").split('/');
  const current = Number(spotArray[0]) || 0;
  const total = Number(spotArray[1]) || 1; 
  const fillPercentage = Math.min((current / total) * 100, 100);

  const schedule = useMemo(() => {
    if (!startTime) return "---";
    const dt = new Date(startTime);
    if (isNaN(dt.getTime())) return "---";
    const day = dt.toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase();
    const date = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${day}, ${date}`;
  }, [startTime]);

  useEffect(() => {
    // ✅ Always Open Battles
if (isInstantBattle) {
  setTimeLeft("ALWAYS OPEN");
  setIsUrgent(false);
  setIsClosed(false);
  return;
}
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      if (isNaN(start)) {
        clearInterval(timer);
        return;
      }

      const liveEnd = start + ((duration || 15) * 60 * 1000);
      
      const diffToStart = start - now;
      const diffToEnd = liveEnd - now;

      if (diffToEnd <= 0) {
        setTimeLeft("BATTLE CLOSED");
        setIsUrgent(false);
        setIsClosed(true);
        clearInterval(timer);
        return;
      } else if (diffToStart <= 0) {
        const m = Math.floor((diffToEnd % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffToEnd % (1000 * 60)) / 1000);
        setTimeLeft(`LIVE: ${m}m ${s}s left`);
        setIsUrgent(true);
        setIsClosed(false);
      } else {
        const d = Math.floor(diffToStart / (1000 * 60 * 60 * 24));
        const h = Math.floor((diffToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diffToStart % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diffToStart % (1000 * 60)) / 1000);

        const totalHours = (d * 24) + h;
        setTimeLeft(`${totalHours > 0 ? totalHours + "h " : ""}${m}m ${s}s`);
        
        if (diffToStart <= 60000) setIsUrgent(true);
        setIsClosed(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration]);

  const handleActionClick = (e) => {
    e.stopPropagation(); 
    if (isCompletedByUser || isClosed) {
      navigate(`/contest-leaderboard/${id}`);
    } else {
      // 🔥 ALWAYS ROUTE TO CONTEST DETAILS
      navigate(`/contest/${id}`);
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      whileHover={!isClosed || isCompletedByUser ? { y: -5 } : {}}
      onClick={handleActionClick} 
      className={`bg-white rounded-3xl md:rounded-[2.5rem] p-5 md:p-7 shadow-sm border border-slate-100 relative overflow-hidden group transition-all cursor-pointer ${isClosed && !isCompletedByUser ? 'opacity-90' : 'hover:border-purple-200'}`}
    >
      {bannerImage && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={bannerImage} 
            alt="" 
            className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-[0.25] ${isClosed ? 'blur-[8px]' : 'blur-[1px]'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white" />
        </div>
      )}

      {isClosed && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/10 backdrop-blur-[2px]">
          <motion.h2 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-8xl font-black text-red-600/20 uppercase tracking-tighter select-none rotate-[-12deg] pointer-events-none"
          >
            CLOSED
          </motion.h2>
        </div>
      )}

      <div className={`relative z-10 transition-all duration-300 ${isClosed ? 'blur-[4px]' : ''}`}>
        
        {/* 🔥 PERFECTLY NESTED CORNER BADGES */}
        {isCompletedByUser ? (
            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[8px] md:text-[9px] font-black px-3 py-1 md:px-4 md:py-1.5 rounded-bl-2xl uppercase z-20 shadow-lg border-l border-b border-white/10">
              Completed 🛡️
            </div>
        ) : isJoined ? (
          <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[8px] md:text-[9px] font-black px-3 py-1 md:px-4 md:py-1.5 rounded-bl-2xl uppercase z-10 shadow-lg border-l border-b border-emerald-400">
            Already Joined ⚔️
          </div>
        ) : isFilling && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] md:text-[9px] font-black px-3 py-1 md:px-4 md:py-1.5 rounded-bl-2xl uppercase animate-pulse z-10 shadow-lg border-l border-b border-red-400">
            Filling Fast!
          </div>
        )}
        
        <div className="mb-4 md:mb-6 pt-2 md:pt-0">
            <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
              <span 
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(battleCode || "N/A");
                  toast.success("Battle Code Copied!");
                }}
                className="text-[8px] md:text-[9px] font-black uppercase px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm" 
                title="Copy Battle Code"
              >
                {battleCode || "N/A"} <Copy size={10} />
              </span>

              <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest backdrop-blur-md px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border shadow-sm inline-block ${isCompletedByUser ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-purple-100/80 text-purple-700 border-purple-200'}`}>
                {category || "Global"} {subCategory && subCategory !== "General" ? `› ${subCategory}` : ''}
              </span>
              
              {!isClosed && !isInstantBattle && (
  <span className="text-[8px] ...">
    <Clock size={10} /> {duration || 15} MINS
  </span>
)}
            </div>
            <h3 className={`text-lg md:text-xl font-black mt-2 md:mt-3 leading-tight uppercase tracking-tighter drop-shadow-sm transition-colors pr-8 ${isCompletedByUser ? 'text-slate-600' : 'text-slate-900 group-hover:text-purple-600'}`}>
              {title}
            </h3>

            <div className="mt-2 md:mt-3 flex items-center gap-1.5 md:gap-2 flex-wrap">
                <div className="flex items-center gap-1 md:gap-1.5 bg-slate-100 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-slate-200 shadow-inner">
                   <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-500" />
                   <span className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-tighter">{schedule}</span>
                </div>
                <div className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full border shadow-inner ${isUrgent ? 'bg-red-50 border-red-200' : isCompletedByUser ? 'bg-slate-50 border-slate-200' : 'bg-purple-50 border-purple-200'}`}>
                  {isCompletedByUser ? <Lock className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-400" /> : <Timer className={`w-2.5 h-2.5 md:w-3 md:h-3 ${isUrgent ? 'text-red-600' : 'text-purple-600'}`}/>}
                  <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-tighter ${isUrgent ? 'text-red-600 animate-pulse' : isCompletedByUser ? 'text-slate-500' : 'text-purple-600'}`}>
                    {isCompletedByUser ? "SESSION FINALIZED" : isUrgent ? "Closing: " : "Starts: "} {timeLeft}
                  </span>
                </div>
            </div>
        </div>

        <div className="mb-4 md:mb-6 space-y-1.5 md:space-y-2">
          <div className="flex justify-between items-center text-[9px] md:text-[10px] font-black uppercase tracking-tight">
            <span className="text-slate-500">Warriors Joined</span>
            <span className={`px-1.5 md:px-2 py-0.5 rounded border ${isCompletedByUser ? 'text-slate-400 bg-slate-100 border-slate-200' : 'text-purple-600 bg-purple-50 border-purple-100'}`}>{spots}</span>
          </div>
          <div className="w-full bg-slate-200/50 h-2 md:h-2.5 rounded-full overflow-hidden border border-slate-100 shadow-inner">
            <motion.div 
              initial={false} 
              animate={{ width: `${fillPercentage}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`h-full shadow-[0_0_10px_rgba(147,51,234,0.4)] ${isCompletedByUser ? 'bg-slate-400' : 'bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500'}`} 
            />
          </div>
        </div>

        <div className="flex justify-between items-center bg-white/60 backdrop-blur-xl p-3 md:p-4 rounded-xl md:rounded-2xl mb-4 md:mb-6 border border-slate-200 shadow-sm">
            <div>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Prize Pool</p>
              <p className={`font-black text-base md:text-lg italic tracking-tight ${isCompletedByUser ? 'text-slate-400' : 'text-emerald-600'}`}>{prize}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Fee</p>
              <p className={`font-black text-base md:text-lg italic tracking-tight ${isCompletedByUser ? 'text-slate-400' : 'text-slate-900'}`}>{entry}</p>
            </div>
        </div>
      </div>

      <button 
        onClick={handleActionClick}
        className={`relative z-10 w-full py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 md:gap-2 ${
        isCompletedByUser || isClosed
          ? "bg-slate-900 text-slate-400 border border-white/5 hover:bg-black shadow-xl"
          : isJoined 
            ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100" 
            : isUrgent
              ? "bg-red-600 text-white animate-pulse shadow-red-200"
              : "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-200"
      }`}>
        {isCompletedByUser || isClosed ? <>View Standings <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4"/></> : isJoined ? "Continue to Arena" : isUrgent ? <>JOIN LIVE NOW <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4"/></> : "Enter Arena"}
      </button>
    </motion.div>
  );
});

const ActivityItem = ({ title, result, time, isWin = false }) => (
  <div className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isWin ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{isWin ? <TrendingUp size={18}/> : <History size={18}/>}</div>
      <div>
        <p className="text-[11px] font-black text-black truncate w-24 uppercase">{title}</p>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{time}</p>
      </div>
    </div>
    <span className={`text-xs font-black ${isWin ? 'text-emerald-600' : 'text-slate-500'}`}>{result}</span>
  </div>
);

export default Dashboard;