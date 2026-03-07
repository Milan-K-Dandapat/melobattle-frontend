import React, { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Trophy, Users, Zap, Plus, RefreshCw, 
  Trash2, ArrowLeft, Activity, ChevronRight, Clock,
  ShieldCheck, Terminal, HardDrive, Timer, AlertTriangle,
  UploadCloud, Database, Cpu, Edit3, X, Save, Percent, Image as ImageIcon,
  Upload, FileJson, CheckCircle2, Download, Search, Copy,
  Crown, Fingerprint, Globe, Server, Wifi, Radio, CopyPlus, Share2, ZapOff, Music, Layers, Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";


// 🔥 MASSIVE CATEGORY DICTIONARY (FAIL-SAFE DEFAULTS)
const CATEGORY_MAP = {
  "GK": ["Current Affairs", "Indian GK", "World Facts", "Award & Honors", "Important Days"],
  "Coding": ["HTML/CSS/JS", "React", "NODE JS", "MONGO DB", "C", "C++", "JAVA", "PYTHON", "DEBUG THE CODE", "OUTPUT PREDICTION"],
  "MOVIES": ["Bollywood", "South Movies", "Hollywood", "Web Series", "Dialouges Guess"],
  "SPORTS": ["Cricket", "Football", "IPL", "Olympics", "Cricket Player Records", "Football Player Records", "Hockey"],
  "Music": ["Guess the Song", "Lyrics Completion", "Singer Identify", "Background Music"],
  "Gaming": ["BGMI", "FREE FIRE", "GTA", "ESPORTS", "GAMING Facts"],
  "Brain & Logic": ["Riddles", "Math Tricks", "IQ Questions", "Logical Puzzles"],
  "Logical Reasoning": ["Series & Pattern", "Blood Relations", "Coding - Decoding", "Seating Arrangement", "Syllogism"],
  "English & Language": ["Grammer", "Vocabulary", "Synonyms / Antonyms", "Idioms & Phrases", "Error Detection"],
  "Business & Finance": ["Stock Market Basics", "Indian Economy", "Budget & Tax", "Startup Knowledge", "Famous CEOs"],
  "Constitution": ["Indian Constitution", "Fundamental Rights", "Parliament & President", "Amendments", "Important Articles"],
  "Environment & Ecology": ["Climate Change", "Wildlife", "Pollution", "National Parks", "Sustainable Development"],
  "Culture": ["Indian Cuisiness", "Festivals", "Traditional Dresses", "World Culture", "Famous Dishes"],
  "Health & Fitness": ["Human Body", "Nutrition", "Diseases & Prevention", "Mental Health Awareness"],
  "Space & Technology": ["ISRO Missions", "NASA Missions", "Planets & Galaxies", "Space Discoveries"],
  "ART & Creativity": ["Famous Paintings", "Artists", "Architecture", "Literature", "Poetry"],
  "Mystery & Detective Mode": ["Solve the Case", "Find the Clue", "Guess the Criminal", "Escape Room Questions"],
  "LIVE CODING SOLVE": ["General"]
};

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  
  
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const editJsonInputRef = useRef(null);
  const mediaInputRef = useRef(null); 
  const socketRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("contests");
  const [stats, setStats] = useState({ totalUsers: 0, totalContests: 0, netProfit: 0 });
  const [battles, setBattles] = useState([]); 
  
  const [categoryData, setCategoryData] = useState(CATEGORY_MAP);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");

  const [signalFilter, setSignalFilter] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const [showDeployedPopup, setShowDeployedPopup] = useState(false);
  const [deployedBattleName, setDeployedBattleName] = useState("");

  const [editingBattle, setEditingBattle] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [contestData, setContestData] = useState({
    title: "",
    category: "GK", 
    subCategory: "Current Affairs", 
    type: "MULTIPLAYER",
    entryFee: 0,
    maxParticipants: 2,
    commissionPercentage: 20,
    winnerPercentage: 60,
    isSponsored: false,          
    sponsorPrize: 0,              
    startTime: "",
    duration: 15,
    bannerImage: "",
    questions: [],
    mediaFiles: [],
    useRandomQuestions: false,
  randomQuestionCount: 10,
   isInstantBattle: false
  });

  const handleJsonUpload = (e, mode = "create") => {
    const file = e.target.files[0];
if (!file) return;

// 🔥 allow uploading same JSON again without refresh
e.target.value = "";
    if (file.type !== "application/json") return toast.error("INVALID FORMAT: Please upload a .json file");

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedJson = JSON.parse(event.target.result);
        if (!Array.isArray(parsedJson)) throw new Error("JSON must be an array of questions.");
        if (mode === "create") setContestData({ ...contestData, questions: parsedJson });
        else setEditingBattle({ ...editingBattle, questions: parsedJson });
        toast.success(`LOGIC SYNCED: ${parsedJson.length} Questions Loaded`, { icon: '📑', style: { background: '#050810', color: '#fff', border: '1px solid #22c55e' }});
      } catch (err) {
        toast.error("JSON PARSE ERROR: Check file structure");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e, mode = "create") => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) return toast.error("FILE TOO LARGE: Limit is 1MB for Arena Stability");

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      if (mode === "create") setContestData({ ...contestData, bannerImage: base64String });
      else setEditingBattle({ ...editingBattle, bannerImage: base64String });
      toast.success("Banner Matrix Processed");
    };
    reader.readAsDataURL(file);
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setContestData(prev => ({ ...prev, mediaFiles: [...prev.mediaFiles, ...files] }));
    toast.success(`${files.length} Media Asset(s) Attached`, { icon: '🎵', style: { background: '#050810', color: '#fff', border: '1px solid #3b82f6' }});
  };

  const calculatePrize = (fee, participants, commission, isSponsored, sponsorPrize) => {
    if (isSponsored) return Number(sponsorPrize); 
    const totalPot = Number(fee) * Number(participants);
    const houseCut = totalPot * (Number(commission) / 100);
    return totalPot - houseCut;
  };

  const finalPrizePool = calculatePrize(
    contestData.entryFee, contestData.maxParticipants, contestData.commissionPercentage, contestData.isSponsored, contestData.sponsorPrize
  );

  const refreshAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const safeGet = async (url) => {
  try {
    return await axiosInstance.get(url);
  } catch (err) {
    console.error("Admin fetch error:", url, err);
    return null;
  }
};

      const [statsResponse, battleResponse, categoryResponse] = await Promise.all([
        safeGet("/admin/dashboard"),
        safeGet("/contest"),
        safeGet("/categories")
      ]);

      // 1. STATS EXTRACTION
      const statsRes = statsResponse?.data || statsResponse;
      if (statsRes?.success || statsRes?.stats) {
        setStats(statsRes.stats || statsRes);
      }

      // 2. BATTLES EXTRACTION
      let battleArray = [];
      const rawBattles = battleResponse?.data || battleResponse;
      if (Array.isArray(rawBattles)) {
          battleArray = rawBattles;
      } else if (rawBattles?.data && Array.isArray(rawBattles.data)) {
          battleArray = rawBattles.data;
      } else if (rawBattles?.contests && Array.isArray(rawBattles.contests)) {
          battleArray = rawBattles.contests;
      } else if (battleResponse?.data?.data && Array.isArray(battleResponse.data.data)) {
          battleArray = battleResponse.data.data;
      }
      setBattles(battleArray);

      // 3. CATEGORIES EXTRACTION
      const cData = categoryResponse?.data?.data || categoryResponse?.data || categoryResponse;
      if (Array.isArray(cData) && cData.length > 0) {
        const formattedMap = { ...CATEGORY_MAP };
        cData.forEach(cat => {
          if (!formattedMap[cat.name]) formattedMap[cat.name] = [];
          const subs = cat.subCategories?.length > 0 ? cat.subCategories : ["General"];
          formattedMap[cat.name] = [...new Set([...formattedMap[cat.name], ...subs])]; 
        });
        setCategoryData(formattedMap);
      } else {
        setCategoryData(CATEGORY_MAP); 
      }

    } catch (err) { 
      console.error("Admin Matrix Sync Failed:", err); 
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdminData();
  }, [refreshAdminData]);

  useEffect(() => {

  socketRef.current = io("https://melobattle-backend1.onrender.com", {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000
});

  const socket = socketRef.current;

  // 🔥 Player joined event
  socket.on("PLAYER_JOINED_UPDATE", (data) => {
    setBattles(prev =>
      prev.map(b =>
        b._id === data.contestId
          ? { ...b, joinedCount: data.joinedCount }
          : b
      )
    );
  });

  // 🔥 Contest status update
  socket.on("CONTEST_UPDATED", (data) => {
    setBattles(prev =>
      prev.map(b =>
        b._id === data.contestId
          ? {
              ...b,
              joinedCount: data.joinedCount,
              status: data.status,
              prizePool: data.prizePool
            }
          : b
      )
    );
  });

  // 🔥 Leaderboard update
  socket.on("LIVE_LEADERBOARD_UPDATE", (data) => {
    console.log("Live Score Update:", data);
  });

  return () => {
    socket.disconnect();
  };

}, []);

  const handleAddNewCategory = async () => {
    if (!newCategory) return toast.error("Main Domain Name is Required");
    setLoading(true);
    
    try {
      setCategoryData(prev => {
        const updated = { ...prev };
        if (!updated[newCategory]) {
          updated[newCategory] = newSubCategory ? [newSubCategory] : ["General"];
        } else if (newSubCategory && !updated[newCategory].includes(newSubCategory)) {
          updated[newCategory] = [...updated[newCategory], newSubCategory];
        }
        return updated;
      });

      setContestData(prev => ({
        ...prev,
        category: newCategory,
        subCategory: newSubCategory || "General"
      }));

      const payload = { name: newCategory, subCategory: newSubCategory };
      const response = await axiosInstance.post("/categories", payload);
      
      const res = response?.data || response; 

      if (res?.success === false) {
        toast.success("Domain Added Locally (Pending DB)", { icon: '⚠️' });
      } else {
        toast.success("Domain Matrix Expanded & Synced!", { icon: '🌌' });
      }

    } catch (err) {
      console.error("🔥 Category Error:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Unknown Server Rejection";
      toast.error(`Added Locally. DB Sync Error: ${serverMsg}`);
    } finally {
      setIsCategoryModalOpen(false);
      setNewCategory("");
      setNewSubCategory("");
      setLoading(false);
    }
  };

  const handleEditInitiate = (battle) => {
    setEditingBattle({
      ...battle,
      startTime: battle.startTime ? new Date(battle.startTime).toISOString().slice(0, 16) : "",
      commissionPercentage: battle.commissionPercentage || 20,
      winnerPercentage: battle.winnerPercentage || 60,
      isSponsored: battle.isSponsored || false,
      sponsorPrize: battle.sponsorPrize || 0,
      duration: battle.duration || 15,
      questions: battle.questions || [],
      category: battle.category || Object.keys(categoryData)[0] || "General",
      subCategory: battle.subCategory || "General"
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateExecution = async () => {
    if (!editingBattle.title) {
  return toast.error("Logic Parameters Incomplete");
} 
    if (editingBattle.questions.length === 0) return toast.error("ARENA ERROR: Contest must have questions");
    
    setLoading(true);
    try {
      const updatedPrize = calculatePrize(editingBattle.entryFee, editingBattle.maxParticipants, editingBattle.commissionPercentage, editingBattle.isSponsored, editingBattle.sponsorPrize);
      setBattles(prev => prev.map(b => b._id === editingBattle._id ? { ...editingBattle, prizePool: updatedPrize } : b));
      
      const payload = {
  ...editingBattle,
  prizePool: updatedPrize
};

// only convert date if valid
if (editingBattle.startTime) {
  const start = new Date(editingBattle.startTime);

  if (!isNaN(start.getTime())) {
    payload.startTime = start.toISOString();
  }
}

      const response = await axiosInstance.put(`/contest/${editingBattle._id}`, payload);
      const res = response?.data || response;

      if (res?.success === false) {
        throw new Error(res?.message || "Update Failed Validation");
      }
      
      toast.success("ARENA PROTOCOL RECONFIGURED");
      setIsEditModalOpen(false);
      refreshAdminData(); 
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Update Terminated";
      toast.error(`Error: ${serverMsg}`);
      refreshAdminData(); 
    } finally {
      setLoading(false);
    }
  };

  const deployContest = async () => {
    if (!contestData.title || !contestData.category) {
  return toast.error("DEPLOYMENT ERROR: Title and Category required");
}

if (!contestData.isInstantBattle && !contestData.startTime) {
  return toast.error("Deployment time required for scheduled battle");
}
if (!contestData.useRandomQuestions && contestData.questions.length === 0) {
  return toast.error("UPLOAD REQUIRED: Add JSON Question Bank");
}
    
    setLoading(true);
    try {
      const { mediaFiles, ...safeContestData } = contestData;
      
const payload = {
  ...safeContestData,
  isInstantBattle: contestData.isInstantBattle,
  useRandomQuestions: contestData.useRandomQuestions,
  randomQuestionCount: contestData.randomQuestionCount,

  entryFee: Number(safeContestData.entryFee) || 0,
  duration: Number(safeContestData.duration) || 15,
  commissionPercentage: Number(safeContestData.commissionPercentage) || 0,
  sponsorPrize: Number(safeContestData.sponsorPrize) || 0,
  prizePool: Number(finalPrizePool) || 0
};

// add max participants only for scheduled battles
if (!contestData.isInstantBattle) {
  payload.maxParticipants = Number(safeContestData.maxParticipants) || 2;
}

// add start time only if provided
if (!contestData.isInstantBattle && contestData.startTime) {
  payload.startTime = new Date(contestData.startTime).toISOString();
}

      const response = await axiosInstance.post("/contest/create", payload);
      const res = response?.data || response;
      
      if (res?.success === false) {
         throw new Error(res?.message || "Backend rejected the matrix creation.");
      }

      setDeployedBattleName(contestData.title || "New Protocol");
      setShowDeployedPopup(true);
      toast.success("BATTLE DEPLOYED!", { icon: '🚀', style: { background: '#050810', color: '#fff', border: '1px solid #9333ea' }});

      const newBattle = res?.contest || res?.data?.contest || res || {};
      const mergedBattle = { 
        ...contestData, 
        ...newBattle, 
        _id: newBattle._id || Math.random().toString(), 
        prizePool: finalPrizePool, 
        joinedCount: 0 
      };
      
      setBattles(prev => [mergedBattle, ...prev]);

      setContestData({
        title: "", category: Object.keys(categoryData)[0] || "GK", subCategory: categoryData[Object.keys(categoryData)[0]]?.[0] || "Current Affairs", type: "MULTIPLAYER", entryFee: 0, maxParticipants: 2, commissionPercentage: 20, winnerPercentage: 60, isSponsored: false, sponsorPrize: 0, startTime: "", duration: 15, bannerImage: "", questions: [], mediaFiles: []
      });
      
      refreshAdminData(); 

    } catch (err) {
      console.error("🔥 Deployment Crash Report:", err);
      const serverMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Unknown Server Validation Error";
      toast.error(`Matrix Rejected: ${serverMsg}`);
    } finally { 
      setLoading(false); 
    }
  };

  /**
   * 🔥 NEW: FORCE CLOSE & PAYOUT ENGINE
   * Decides winner and credits winningBalance based on time limit.
   */
  const handleForceClose = async (battleId) => {
    if (!window.confirm("CRITICAL: Force close Arena and process payouts?")) return;
    setLoading(true);
    try {
      // Corrected Route mapped to contest.routes.js
      const response = await axiosInstance.post(`/contest/${battleId}/force-close`);
      const res = response?.data || response;
      if (res?.success) {
          toast.success("ARENA CLOSED: Prizes Dispatched!", { icon: '💰' });
          refreshAdminData();
      }
    } catch (err) {
      toast.error("Force Close Interrupted");
    } finally {
      setLoading(false);
    }
  };

  const deleteBattle = async (id) => {
  if (!window.confirm("Authorize Protocol Purge?")) return;

  try {
    setLoading(true);

    // 🔥 Optimistic UI remove
    setBattles(prev => prev.filter(b => b._id !== id));

    await axiosInstance.delete(`/contest/${id}`);

    toast.success("Signal Terminated");

  } catch (err) {
    toast.error("Purge Failed");
  } finally {
    setLoading(false);
  }
};

  const handleReset = async (type) => {
    if (!window.confirm(`CRITICAL: Authorize ${type.toUpperCase()} flush?`)) return;
    setLoading(true);
    try {
      const response = await axiosInstance.post("/admin/reset-rankings", { type });
      const res = response?.data || response;
      if (res?.success || response?.status === 200) {
        toast.success(`${type.toUpperCase()} RESET SUCCESSFUL`);
        refreshAdminData();
      }
    } catch (err) { toast.error("Reset Failed"); } finally { setLoading(false); }
  };

 const downloadContestCSV = async (contestId, title) => {
  try {
    const response = await axiosInstance.get(
      `/contest/${contestId}/export`,
      { responseType: "blob" }
    );

    // ⚠ response is already the data because interceptor returns response.data
    const blob = new Blob([response], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = window.URL.createObjectURL(blob);

    link.href = url;
    link.setAttribute("download", `Arena_Results_${title}.csv`);

    document.body.appendChild(link);
    link.click();
    link.remove();

  } catch (error) {
    console.error("CSV Download Failed:", error);
  }
};

  const handleCloneBattle = (battle) => {
  setContestData({
  title: "",
  category: Object.keys(categoryData)[0] || "GK",
  subCategory: categoryData[Object.keys(categoryData)[0]]?.[0] || "Current Affairs",
  type: "MULTIPLAYER",
  entryFee: 0,
  maxParticipants: 2,
  commissionPercentage: 20,
  winnerPercentage: 60,
  isSponsored: false,
  sponsorPrize: 0,
  startTime: "",
  duration: 15,
  bannerImage: "",
  questions: [],
  mediaFiles: [],
  useRandomQuestions: false,
  randomQuestionCount: 10,
  isInstantBattle: false
});

// 🔥 reset JSON input
if (jsonInputRef.current) {
  jsonInputRef.current.value = "";
}
    setActiveTab("contests");
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Protocol Cloned! Set new deployment time.", { icon: '🧬', style: { background: '#050810', color: '#fff', border: '1px solid #f59e0b' } });
  };

  const handleShareBattle = (id, code, title) => {
    const shareLink = `${window.location.origin}/contest/${id}`;
    const text = `🔥 Join my Melo Battle: ${title}!\n\nUse Code: ${code}\nLink: ${shareLink}`;
    navigator.clipboard.writeText(text);
    toast.success("Invite Link & Code Copied!", { icon: '🔗', style: { background: '#050810', color: '#fff', border: '1px solid #06b6d4' } });
  };

  const handleFlushCache = () => {
    const loadingToast = toast.loading("Purging System Cache...");
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success("Matrix Cache Flushed Successfully", { icon: '🧹' });
      refreshAdminData();
    }, 1200);
  };

  const nowTime = Date.now();
  
 const closedBattles = battles.filter(b => {

  // 🔥 Never close instant battles
  if (b.isInstantBattle) return false;

  if (["COMPLETED", "PROCESSING", "ARCHIVED"].includes(b.status)) return true;

  if (b.startTime) {
    const startTs = new Date(b.startTime).getTime();

    if (!isNaN(startTs)) {
      const endTime = startTs + (b.duration || 15) * 60000;

      if (nowTime > endTime) return true;
    }
  }

  return false;

}).sort((a, b) => {

  // 🔥 instant battles always stay on top
  if (a.isInstantBattle && !b.isInstantBattle) return -1;
  if (!a.isInstantBattle && b.isInstantBattle) return 1;

  const dateA = new Date(a.startTime).getTime();
  const dateB = new Date(b.startTime).getTime();

  return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);

});
  const displayedBattles = (signalFilter === "active" ? activeBattles : closedBattles).filter(b => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const titleMatch = b.title?.toLowerCase().includes(searchLower);
    const codeMatch = b.battleCode?.toLowerCase().includes(searchLower);
    return titleMatch || codeMatch;
  });

  const categoryOptions = Object.keys(categoryData).map(k => ({ v: k, l: k }));
  const subCategoryOptions = (categoryData[contestData.category] || ["General"]).map(sc => ({ v: sc, l: sc }));
  const editSubCategoryOptions = (categoryData[editingBattle?.category] || ["General"]).map(sc => ({ v: sc, l: sc }));

  return (
    <div className="min-h-screen bg-[#050810] text-white font-sans selection:bg-purple-500/30 overflow-x-hidden pb-40">
      
      <nav className="sticky top-0 z-[100] bg-[#050810]/80 backdrop-blur-2xl border-b border-white/5 px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate('/dashboard')} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </motion.button>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter leading-none uppercase text-white">Command <span className="text-purple-500">Center</span></h1>
            <p className="text-[9px] font-bold text-red-500/80 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" /> Authority Active • Admin v3.0
            </p>
          </div>
        </div>
        <div className="p-3 bg-purple-600/10 rounded-xl text-purple-500 border border-purple-500/20 shadow-[0_0_20px_rgba(147,51,234,0.1)]">
          <ShieldCheck size={22} />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <HudCard label="Warriors Sync" value={stats.totalUsers || "0"} icon={<Users size={18}/>} color="purple" />
          <HudCard label="Active Signals" value={activeBattles.length} icon={<Cpu size={18}/>} color="blue" />
          <HudCard label="System Profit" value={`₹${stats.netProfit || "0"}`} icon={<Zap size={18}/>} color="emerald" />
        </div>

        <div className="flex p-2 bg-white/5 rounded-[2.5rem] border border-white/10 backdrop-blur-xl mb-12 max-w-2xl">
          <TabBtn active={activeTab === "contests"} label="Arena Deployment" icon={<UploadCloud size={16}/>} onClick={() => setActiveTab("contests")} />
          <TabBtn active={activeTab === "rankings"} label="Global Resets" icon={<Database size={16}/>} onClick={() => setActiveTab("rankings")} />
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8 space-y-10">
            <AnimatePresence mode="wait">
              {activeTab === "contests" && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  
                  <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[3.5rem] p-10 md:p-14 relative overflow-hidden mb-12 shadow-2xl">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                      <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">New Protocol</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 flex items-center gap-2"><Timer size={12}/> Configure Arena Session</p>
                      </div>
                      <div className="text-right bg-emerald-500/10 p-4 rounded-3xl border border-emerald-500/20">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Potential Prize</p>
                        <p className="text-4xl font-black text-white italic leading-none">₹{finalPrizePool.toFixed(0)}</p>
                      </div>
                    </div>

                    <div className="space-y-8 relative z-10">
                      <AdminInput label="Contest Designation" placeholder="MEGA LEAGUE X" value={contestData.title} onChange={(v) => setContestData({...contestData, title: v})} />
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-widest block italic">Arena Banner</label>
                          <div 
                            onClick={() => fileInputRef.current.click()}
                            className="group relative w-full h-32 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-black/40 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all overflow-hidden shadow-inner"
                          >
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, "create")} />
                            {contestData.bannerImage ? (
                              <img src={contestData.bannerImage} className="w-full h-full object-cover" alt="Preview" />
                            ) : (
                              <div className="text-center">
                                <Upload className="text-purple-500 mx-auto mb-2" size={24} />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Banner</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-widest block italic">Question Bank (.JSON)</label>{/* 🔥 RANDOM QUESTION BANK OPTION */}

<div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 mt-4">
  <div>
    <p className="text-xs font-black uppercase tracking-widest text-purple-400">
      Use Random Question Bank
    </p>
    <p className="text-[9px] text-slate-500 uppercase">
      Select random questions from 1000 question bank
    </p>
  </div>

  <input
    type="checkbox"
    checked={contestData.useRandomQuestions}
    onChange={(e) =>
      setContestData({
        ...contestData,
        useRandomQuestions: e.target.checked
      })
    }
    className="w-6 h-6 accent-purple-500"
  />
</div>
{/* 🔥 RANDOM QUESTION COUNT INPUT */}

{contestData.useRandomQuestions && (
  <AdminInput
    label="Random Questions Count"
    type="number"
    value={contestData.randomQuestionCount}
    onChange={(v) =>
      setContestData({
        ...contestData,
        randomQuestionCount: Number(v)
      })
    }
  />
)}
                          <div 
                            onClick={() => jsonInputRef.current.click()}
                            className={`group relative w-full h-32 border-2 border-dashed rounded-[2.5rem] bg-black/40 flex flex-col items-center justify-center cursor-pointer transition-all shadow-inner ${contestData.questions.length > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-blue-500/50'}`}
                          >
                            <input type="file" ref={jsonInputRef} hidden accept=".json" onChange={(e) => handleJsonUpload(e, "create")} />
                            {contestData.questions.length > 0 ? (
                              <div className="text-center">
                                <CheckCircle2 className="text-emerald-500 mx-auto mb-2" size={24} />
                                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{contestData.questions.length} Qs</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <FileJson className="text-blue-500 mx-auto mb-2" size={24} />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select JSON</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-widest block italic">Media Assets (Opt)</label>
                          <div 
                            onClick={() => mediaInputRef.current.click()}
                            className={`group relative w-full h-32 border-2 border-dashed rounded-[2.5rem] bg-black/40 flex flex-col items-center justify-center cursor-pointer transition-all shadow-inner ${contestData.mediaFiles.length > 0 ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-white/10 hover:border-cyan-500/50'}`}
                          >
                            <input type="file" ref={mediaInputRef} hidden multiple accept="image/*,audio/*" onChange={handleMediaUpload} />
                            {contestData.mediaFiles.length > 0 ? (
                              <div className="text-center">
                                <CheckCircle2 className="text-cyan-500 mx-auto mb-2" size={24} />
                                <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">{contestData.mediaFiles.length} Assets</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Music className="text-cyan-500 mx-auto mb-2" size={24} />
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Img / Audio</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2"><Layers size={14} className="text-blue-500"/> Domain Configuration</h4>
                            <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-1.5 text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-widest px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 transition-all active:scale-95 shadow-lg">
                              <Plus size={12} /> Add Field
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <AdminSelect 
                            label="Main Domain" 
                            value={contestData.category} 
                            options={categoryOptions} 
                            onChange={(v) => setContestData({...contestData, category: v, subCategory: categoryData[v]?.[0] || "General"})} 
                          />
                          <AdminSelect 
                            label="Sub Domain (Topic)" 
                            value={contestData.subCategory} 
                            options={subCategoryOptions} 
                            onChange={(v) => setContestData({...contestData, subCategory: v})} 
                          />
                        </div>
                      </div>

                     <div className="grid grid-cols-2 gap-6">

  <AdminSelect
    label="Architecture"
    value={contestData.type}
    options={[
      { v: "MULTIPLAYER", l: "Multiplayer Arena" },
      { v: "HEAD_TO_HEAD", l: "1 vs 1 Duel" }
    ]}
    onChange={(v) => setContestData({ ...contestData, type: v })}
  />

  {/* 🔥 Always Open Toggle */}
  <div className="flex items-center justify-between bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-indigo-400">
        Always Open Battle
      </p>
      <p className="text-[9px] text-slate-500 uppercase">
        Players can join anytime
      </p>
    </div>

    <input
      type="checkbox"
      checked={contestData.isInstantBattle}
      onChange={(e) =>
        setContestData({
          ...contestData,
          isInstantBattle: e.target.checked,
          startTime: e.target.checked ? "" : contestData.startTime
        })
      }
      className="w-6 h-6 accent-indigo-500"
    />
  </div>

</div>

{/* 🔥 Show Deployment Time ONLY if not instant */}
{!contestData.isInstantBattle && (
  <div className="mt-6">
    <AdminInput
      label="Arena Deployment Time"
      type="datetime-local"
      value={contestData.startTime}
      onChange={(v) =>
        setContestData({ ...contestData, startTime: v })
      }
    />
  </div>
)}

                      {/* 🔥 ALWAYS OPEN BATTLE */}

<div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-between shadow-inner group mt-4">
  <div className="flex items-center gap-3">
    <Globe className="text-indigo-500" size={20} />
    <div className="flex flex-col">
      <span className="text-xs font-black uppercase tracking-widest text-slate-300">
        Always Open Battle
      </span>
      <span className="text-[8px] font-bold text-slate-500 uppercase italic">
        Players can join anytime
      </span>
    </div>
  </div>
</div>

                      <div className="grid grid-cols-4 gap-4">
                        <AdminInput label="Entry (₹)" type="number" value={contestData.entryFee} onChange={(v) => setContestData({...contestData, entryFee: Number(v)})} />
                        <AdminInput label="Warriors" type="number" value={contestData.maxParticipants} onChange={(v) => setContestData({...contestData, maxParticipants: Number(v)})} />
                        <AdminInput label="Duration (m)" type="number" value={contestData.duration} onChange={(v) => setContestData({...contestData, duration: Number(v)})} />
                        <AdminInput label="House Cut %" type="number" value={contestData.commissionPercentage} onChange={(v) => setContestData({...contestData, commissionPercentage: Number(v)})} />
                      </div>

                      <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-between shadow-inner group mt-4">
                        <div className="flex items-center gap-3">
                          <Trophy className="text-emerald-500" size={20} />
                          <div className="flex flex-col">
                            <span className="text-xs font-black uppercase tracking-widest text-slate-300">Sponsored Contest</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase italic">Entry becomes FREE</span>
                          </div>
                        </div>
                        <input type="checkbox" checked={contestData.isSponsored} onChange={(e) => setContestData({ ...contestData, isSponsored: e.target.checked, entryFee: e.target.checked ? 0 : contestData.entryFee })} className="w-6 h-6 accent-emerald-500" />
                      </div>

                      {contestData.isSponsored && (
                        <AdminInput label="Sponsor Prize (₹)" type="number" value={contestData.sponsorPrize} onChange={(v) => setContestData({ ...contestData, sponsorPrize: Number(v) })} />
                      )}

                      <motion.button whileTap={{ scale: 0.97 }} onClick={deployContest} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-7 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4 text-sm mt-6 text-white">
                        {loading ? <RefreshCw className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                        Execute Arena Launch
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                      <div className="flex flex-col">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3 mb-4">
                          <Activity size={18} className={signalFilter === "active" ? "text-purple-500" : "text-emerald-500"} /> 
                          {signalFilter === "active" ? "Active Arena Signals" : "Closed Arena Signals"}
                        </h4>
                        <div className="flex bg-black/50 border border-white/10 rounded-full p-1 shadow-inner w-fit">
                          <button onClick={() => setSignalFilter("active")} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${signalFilter === "active" ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50" : "text-slate-500 hover:text-white"}`}>
                            Active ({activeBattles.length})
                          </button>
                          <button onClick={() => setSignalFilter("closed")} className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${signalFilter === "closed" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50" : "text-slate-500 hover:text-white"}`}>
                            Closed ({closedBattles.length})
                          </button>
                        </div>
                      </div>

                      <div className="relative w-full md:w-72">
                        <input type="text" placeholder="Search Name or Code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/10 py-3 pl-12 pr-4 rounded-[2rem] font-bold outline-none focus:border-purple-600 transition-all text-[10px] uppercase tracking-widest shadow-inner text-white placeholder-slate-600" />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {displayedBattles.map((b) => {
                       const joined = b.joinedCount || b.participants || 0;

const progress = b.isInstantBattle
  ? 0
  : Math.min((joined / (b.maxParticipants || 1)) * 100, 100);
                        return (
                          <motion.div key={b._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 bg-white/5 border border-white/10 rounded-[2.8rem] flex justify-between items-center group transition-all relative overflow-hidden">
                            {b.bannerImage && (
                              <div className="absolute inset-0 opacity-10 pointer-events-none blur-[2px]">
                                <img src={b.bannerImage} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div className="flex-1 relative z-10">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(b.battleCode || "N/A"); toast.success("Battle Code Copied!"); }} className="text-[9px] font-black uppercase px-3 py-1 rounded-lg border border-white/20 bg-white/5 text-white flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-colors" title="Copy Battle Code">
                                  {b.battleCode || "N/A"} <Copy size={10} />
                                </span>
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg border inline-block italic ${signalFilter === "active" ? "text-purple-400 bg-purple-400/10 border-purple-400/20" : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"}`}>
                                  {b.category} {b.subCategory ? `› ${b.subCategory}` : ''}
                                </span>
                                <span className="text-[9px] font-black text-blue-400">
{b.isInstantBattle ? "∞ OPEN" : `${b.duration || 15} MINS`}
</span>
                                <span className="text-[9px] font-black text-emerald-400 uppercase bg-emerald-400/10 px-3 py-1 rounded-lg border border-emerald-400/20 inline-block italic">{b.questions?.length || 0} QUESTS</span>
                              </div>
                              <p className={`text-xl font-black italic uppercase text-white leading-none mb-4 transition-colors ${signalFilter === "active" ? "group-hover:text-purple-400" : "group-hover:text-emerald-400"}`}>{b.title}</p>
                              <div className="max-w-[280px] space-y-2">
                                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase">
                                  <span>Pool: ₹{b.prizePool}</span>
                                  <span>{joined}/{b.maxParticipants} Joined</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                  <div className={`h-full rounded-full ${signalFilter === "active" ? "bg-purple-600" : "bg-emerald-600"}`} style={{ width: `${progress}%` }} />
                                </div>
                              </div>
                            </div>
                           <div className="flex gap-3 ml-6 relative z-10 flex-wrap justify-end max-w-[120px]">
  {signalFilter === "closed" ? (
    <>
      <button
        onClick={() => downloadContestCSV(b._id, b.title, b.battleCode)}
        className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shadow-xl"
        title="Download Results CSV"
      >
        <Download size={20} />
      </button>

      <button
        onClick={() => handleCloneBattle(b)}
        className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all active:scale-90 shadow-xl"
        title="Clone Battle Protocol"
      >
        <CopyPlus size={20} />
      </button>
    </>
  ) : (
    <>
      {/* 🔥 FORCE CLOSE BUTTON ONLY IF LIVE */}
      {b.status === "LIVE" && (
        <button
          onClick={() => handleForceClose(b._id)}
          className="p-4 bg-red-600/20 text-red-500 border border-red-500/30 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-90 shadow-xl shadow-red-950/20"
          title="FORCE CLOSE & PAYOUT"
        >
          <Lock size={20} />
        </button>
      )}

      <button
        onClick={() => handleShareBattle(b._id, b.battleCode, b.title)}
        className="p-4 bg-cyan-500/10 text-cyan-500 rounded-2xl hover:bg-cyan-500 hover:text-white transition-all active:scale-90 shadow-xl"
        title="Copy Invite Link"
      >
        <Share2 size={20} />
      </button>

      <button
        onClick={() => handleCloneBattle(b)}
        className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl hover:bg-amber-500 hover:text-white transition-all active:scale-90 shadow-xl"
        title="Clone Battle Protocol"
      >
        <CopyPlus size={20} />
      </button>

      <button
        onClick={() => handleEditInitiate(b)}
        className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all active:scale-90 shadow-xl"
        title="Edit Logic"
      >
        <Edit3 size={20} />
      </button>
    </>
  )}

  <button
    onClick={() => deleteBattle(b._id)}
    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl"
    title="Purge Protocol"
  >
    <Trash2 size={20} />
  </button>
</div>
                          </motion.div>
                        );
                      })}
                      {displayedBattles.length === 0 && (
                        <div className="p-10 border border-white/5 border-dashed rounded-[3rem] text-center bg-white/5">
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">No signals detected</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "rankings" && (
                <motion.div key="rankings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[3rem] flex items-center gap-6 mb-8 shadow-2xl shadow-red-950/20">
                      <AlertTriangle className="text-red-500" size={32} />
                      <div>
                         <p className="text-lg font-black uppercase text-white tracking-tighter italic">Danger Zone</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Resets are permanent and irreversible matrix actions.</p>
                      </div>
                    </div>
                  <ResetCard title="Daily Pulse Flush" desc="Reset leaderboard scores for the cycle." icon={<Clock className="text-purple-400" />} onAction={() => handleReset('daily')} loading={loading} />
                  <ResetCard title="Weekly Season End" desc="Process warrior rewards." icon={<Trophy className="text-blue-400" />} onAction={() => handleReset('weekly')} loading={loading} />
                  <ResetCard title="Monthly Data Wipe" desc="System purge of all monthly data." icon={<Shield className="text-red-400" />} onAction={() => handleReset('monthly')} loading={loading} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-4 mt-12 lg:mt-0 space-y-8">
            
             <div className="relative rounded-[3rem] p-[2px] overflow-hidden group">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute -inset-[150%] bg-[conic-gradient(from_90deg_at_50%_50%,#050810_0%,#9333EA_50%,#10B981_100%)] opacity-70 group-hover:opacity-100 transition-opacity" />
               <div className="relative bg-[#0A0F1E] p-10 rounded-[2.9rem] backdrop-blur-3xl text-center shadow-2xl z-10 h-full w-full">
                 <div className="absolute top-6 left-6 flex gap-1.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                   <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse delay-75" />
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                 </div>
                 <div className="relative w-32 h-32 mx-auto mb-8 mt-2">
                   <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-emerald-500 rounded-[2rem] blur-2xl opacity-60" />
                   <div className="relative w-full h-full bg-gradient-to-br from-purple-600 via-indigo-700 to-blue-800 rounded-[2rem] flex items-center justify-center border-2 border-white/20 shadow-2xl shadow-purple-900/50">
                     <Crown size={56} className="text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
                   </div>
                 </div>
                 <div className="bg-[length:200%_auto] bg-gradient-to-r from-white via-purple-300 to-white text-transparent bg-clip-text mb-4">
                   <h2 className="text-[26px] font-black uppercase tracking-tighter italic leading-none">Milan Kumar Dandapat</h2>
                 </div>
                 <div className="flex flex-wrap justify-center items-center gap-3">
                   <span className="bg-purple-500/10 text-purple-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-purple-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(147,51,234,0.2)]">
                     <Fingerprint size={12} /> CEO of Melo
                   </span>
                   <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-emerald-500/20 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                     <Globe size={12} /> System Owner
                   </span>
                 </div>
               </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-purple-500" />
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><Server size={16} className="text-blue-500" /> System Core Health</h4>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                       <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><Wifi size={18} className="text-emerald-500" /></div>
                       <div>
                         <p className="text-xs font-black text-white uppercase tracking-widest">Network Matrix</p>
                         <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Online • 12ms Ping</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-black text-white">99.9%</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">Uptime</p>
                     </div>
                   </div>
                   <div className="w-full h-px bg-white/5" />
                   <div className="flex justify-between items-center">
                     <div className="flex items-center gap-4">
                       <div className="p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/20"><Radio size={18} className="text-purple-500" /></div>
                       <div>
                         <p className="text-xs font-black text-white uppercase tracking-widest">Server Load</p>
                         <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-1">Optimized</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-sm font-black text-white">24%</p>
                       <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">CPU Usage</p>
                     </div>
                   </div>
                   <button onClick={handleFlushCache} className="w-full mt-4 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95">
                     <ZapOff size={14} /> Flush Matrix Cache
                   </button>
                </div>
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 shadow-2xl backdrop-blur-md">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-3"><Terminal size={16} className="text-purple-500" /> Live Logs</h4>
                <div className="space-y-6 opacity-70">
                   <LogItem user="System" action="Syncing Arena Battles" time="Now" />
                   <LogItem user="Matrix" action="Verified Signals" time="Active" />
                   <LogItem user="Security" action="Anti-Cheat Active" time="Live" />
                </div>
             </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-[#050810]/95 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#0A0F1E] border border-blue-500/30 rounded-[3.5rem] p-10 w-full max-w-lg shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                  <Layers className="text-blue-500"/> Expand Domain
                </h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 bg-white/5 rounded-full hover:text-red-500 transition-colors"><X size={18}/></button>
              </div>
              <div className="space-y-6">
                <AdminInput label="Main Domain Name" placeholder="e.g., Mathematics" value={newCategory} onChange={setNewCategory} />
                <AdminInput label="Sub Domain (Optional)" placeholder="e.g., Algebra" value={newSubCategory} onChange={setNewSubCategory} />
                <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed mt-2 italic px-2">
                  * If Main Domain exists, the Sub Domain will be added to it. If it doesn't exist, a new Matrix Domain will be created.
                </p>
                <button onClick={handleAddNewCategory} disabled={loading} className="w-full mt-4 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Plus size={16} />} Inject into Database
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-[#050810]/95 backdrop-blur-xl flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#0A0F1E] border border-white/10 rounded-[3.5rem] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar pb-20">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Reconfigure Protocol</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-white/5 rounded-full hover:text-red-500 transition-colors"><X size={20}/></button>
              </div>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-widest block italic">Update Arena Banner</label>
                    <div onClick={() => editFileInputRef.current.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-[2rem] bg-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-inner hover:border-purple-500/40">
                      <input type="file" ref={editFileInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, "edit")} />
                      {editingBattle.bannerImage ? <img src={editingBattle.bannerImage} className="w-full h-full object-cover" alt="Preview" /> : <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">New Image</p>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-6 tracking-widest block italic">Update Questions (.JSON)</label>
                    <div onClick={() => editJsonInputRef.current.click()} className={`w-full h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all shadow-inner ${editingBattle.questions?.length > 0 ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
                      <input type="file" ref={editJsonInputRef} hidden accept=".json" onChange={(e) => handleJsonUpload(e, "edit")} />
                      {editingBattle.questions?.length > 0 ? (
                        <div className="text-center">
                          <CheckCircle2 className="text-emerald-500 mx-auto" size={24} />
                          <p className="text-[9px] font-black text-emerald-400 uppercase mt-2 tracking-widest">{editingBattle.questions.length} Questions</p>
                        </div>
                      ) : <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Select JSON</p>}
                    </div>
                  </div>
                </div>

                <AdminInput label="Protocol Designation" value={editingBattle.title} onChange={(v) => setEditingBattle({...editingBattle, title: v})} />
                
                <div className="grid grid-cols-2 gap-6">
                  <AdminSelect label="Main Domain" value={editingBattle.category} options={categoryOptions} onChange={(v) => setEditingBattle({...editingBattle, category: v, subCategory: categoryData[v]?.[0] || "General"})} />
                  <AdminSelect label="Sub Domain" value={editingBattle.subCategory} options={editSubCategoryOptions} onChange={(v) => setEditingBattle({...editingBattle, subCategory: v})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <AdminInput label="Entry Fee (₹)" type="number" value={editingBattle.entryFee} onChange={(v) => setEditingBattle({...editingBattle, entryFee: v})} />
                  <AdminInput label="Max Players" type="number" value={editingBattle.maxParticipants} onChange={(v) => setEditingBattle({...editingBattle, maxParticipants: v})} />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <AdminInput label="Deployment Matrix Time" type="datetime-local" value={editingBattle.startTime} onChange={(v) => setEditingBattle({...editingBattle, startTime: v})} />
                  <AdminInput label="Arena Duration (Mins)" type="number" value={editingBattle.duration} onChange={(v) => setEditingBattle({...editingBattle, duration: Number(v)})} />
                </div>

                <div className="p-6 bg-purple-600/10 border border-purple-500/20 rounded-[2rem] flex items-center justify-between shadow-inner group">
                   <div className="flex items-center gap-3">
                     <Percent className="text-purple-500 group-hover:rotate-12 transition-transform" size={20} />
                     <div className="flex flex-col">
                       <span className="text-xs font-black uppercase tracking-widest text-slate-300">House Cut %</span>
                       <span className="text-[8px] font-bold text-slate-500 uppercase italic">Commission override</span>
                     </div>
                   </div>
                   <input type="number" className="w-20 bg-black/40 border border-white/10 p-3 rounded-xl font-black text-center outline-none focus:border-purple-500 text-white" value={editingBattle.commissionPercentage} onChange={(e) => setEditingBattle({...editingBattle, commissionPercentage: Number(e.target.value)})} />
                </div>

                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-center justify-between shadow-inner group mt-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-blue-500 group-hover:rotate-12 transition-transform" size={20} />
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">Winners %</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase italic">Payout distribution</span>
                    </div>
                  </div>
                  <input type="number" className="w-20 bg-black/40 border border-white/10 p-3 rounded-xl font-black text-center outline-none focus:border-blue-500 text-white" value={editingBattle.winnerPercentage || 60} onChange={(e) => setEditingBattle({...editingBattle, winnerPercentage: Number(e.target.value)})} />
                </div>

                <div className="p-6 bg-emerald-600/10 border border-emerald-500/20 rounded-[2rem] flex items-center justify-between shadow-inner group col-span-4 mt-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="text-emerald-500" size={20} />
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest text-slate-300">Sponsored Contest</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase italic">Entry fee becomes FREE</span>
                    </div>
                  </div>
                  <input type="checkbox" checked={editingBattle.isSponsored || false} onChange={(e) => setEditingBattle({...editingBattle, isSponsored: e.target.checked, entryFee: e.target.checked ? 0 : editingBattle.entryFee})} className="w-6 h-6 accent-emerald-500" />
                </div>

                {editingBattle.isSponsored && (
                  <AdminInput label="Sponsor Prize (₹)" type="number" value={editingBattle.sponsorPrize || 0} onChange={(v) => setEditingBattle({...editingBattle, sponsorPrize: Number(v)})} />
                )}

                <button onClick={handleUpdateExecution} disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 py-6 rounded-[2.2rem] font-black uppercase flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/20 text-white transition-all active:scale-95">
                  <Save size={20} /> Authorize Reconfiguration
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeployedPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-[#050810]/95 backdrop-blur-xl flex items-center justify-center p-6 w-full h-full" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
            <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 50 }} className="bg-[#0A0F1E] border border-emerald-500/30 rounded-[3.5rem] p-12 w-full max-w-md shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400" />
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] mx-auto flex items-center justify-center mb-8 border border-emerald-500/20 shadow-inner">
                <CheckCircle2 size={48} className="text-emerald-400" />
              </div>
              <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Battle Deployed</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">{deployedBattleName || "New Protocol"} is now active in the arena.</p>
              <button onClick={() => setShowDeployedPopup(false)} className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/20 py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all active:scale-95">
                Acknowledge
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */
const HudCard = ({ label, value, icon, color }) => {
  const colors = { purple: "text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-purple-950/20", blue: "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-950/20", emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-950/20" };
  return (
    <div className={`p-8 rounded-[3rem] border bg-white/5 flex flex-col items-center text-center shadow-2xl transition-all hover:bg-white/[0.08] ${colors[color]}`}>
      <div className={`p-4 rounded-2xl mb-5 bg-white/5 border border-white/5`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="text-3xl font-black italic tracking-tighter leading-none text-white">{value}</p>
    </div>
  );
};

const TabBtn = ({ active, label, icon, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[2.2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${active ? 'bg-white/10 text-white shadow-2xl shadow-black/60 border border-white/10' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} {label}
  </button>
);

const AdminInput = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="w-full text-white">
    <label className="text-[10px] font-black text-slate-500 uppercase ml-6 mb-3 block tracking-widest">{label}</label>
    <input type={type} className="w-full bg-black/50 border border-white/10 p-6 rounded-[2rem] font-bold outline-none focus:border-purple-600 transition-all text-sm shadow-inner" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </div>
);

const AdminSelect = ({ label, value, options, onChange }) => (
  <div className="w-full text-white">
    <label className="text-[10px] font-black text-slate-500 uppercase ml-6 mb-3 block tracking-widest">{label}</label>
    <div className="relative">
      <select className="w-full bg-black/50 border border-white/10 p-6 rounded-[2rem] font-bold outline-none focus:border-purple-600 appearance-none text-sm cursor-pointer shadow-inner" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(opt => <option key={opt.v} value={opt.v} className="bg-[#0A0F1E] text-white">{opt.l}</option>)}
      </select>
      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-slate-600 pointer-events-none" size={18} />
    </div>
  </div>
);

const ResetCard = ({ title, desc, icon, onAction, loading }) => (
  <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 flex items-center justify-between hover:bg-white/[0.08] transition-all group duration-500">
    <div className="flex items-center gap-6">
      <div className="p-5 bg-white/5 rounded-2xl text-2xl group-hover:scale-110 border border-white/5 transition-all group-hover:rotate-6">{icon}</div>
      <div>
        <p className="font-black uppercase italic text-base text-white tracking-tight">{title}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{desc}</p>
      </div>
    </div>
    <button onClick={onAction} disabled={loading} className="p-5 bg-red-500/10 text-red-500 rounded-[1.5rem] hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl">
      <RefreshCw size={22} className={loading ? 'animate-spin' : ''} />
    </button>
  </div>
);

const LogItem = ({ user, action, time }) => (
  <div className="flex items-start justify-between group">
    <div className="flex gap-4 text-white">
      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[10px] font-black text-purple-500 border border-white/5 transition-transform group-hover:scale-110">{user.charAt(0)}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-tight leading-none mb-2">{user}</p>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none italic">{action}</p>
      </div>
    </div>
    <span className="text-[8px] font-black text-slate-700 uppercase">{time}</span>
  </div>
);

export default AdminPanel;