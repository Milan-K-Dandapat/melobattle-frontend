import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Check, X, Camera, Trophy, 
  Zap, Star, ChevronRight, Settings, 
  LogOut, Wallet, Medal, Bell, ShieldCheck, MapPin,
  ArrowLeft, Volume2, Moon, Eye, Share2, Info, BellRing, Copy, Sun,
  Crown, Flame, Gem, Lock, Terminal, ShieldAlert
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useMusic } from "../../context/MusicContext"; 
import axiosInstance from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AVATAR_VAULT = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Buddy",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Max",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
];

const BADGE_VAULT = [
  { id: 1, name: "Bronze Warrior", icon: <Trophy size={20}/>, color: "text-orange-500", req: "Level 1", type: 'lvl', min: 1 },
  { id: 2, name: "Silver Striker", icon: <Medal size={20}/>, color: "text-slate-400", req: "Level 5", type: 'lvl', min: 5 },
  { id: 3, name: "Gold Gladiator", icon: <Star size={20}/>, color: "text-yellow-500", req: "Level 10", type: 'lvl', min: 10 },
  { id: 4, name: "Platinum Ace", icon: <Zap size={20}/>, color: "text-cyan-400", req: "20 Victories", type: 'wins', min: 20 },
  { id: 5, name: "Diamond Elite", icon: <Gem size={20}/>, color: "text-blue-500", req: "50 Victories", type: 'wins', min: 50 },
  { id: 6, name: "Arena Master", icon: <Flame size={20}/>, color: "text-red-500", req: "Level 25", type: 'lvl', min: 25 },
  { id: 7, name: "Grand Legend", icon: <ShieldCheck size={20}/>, color: "text-purple-500", req: "100 Victories", type: 'wins', min: 100 },
  { id: 8, name: "Skill Titan", icon: <Zap size={20}/>, color: "text-indigo-500", req: "Level 50", type: 'lvl', min: 50 },
  { id: 9, name: "Immortal", icon: <Trophy size={20}/>, color: "text-emerald-500", req: "500 Victories", type: 'wins', min: 500 },
  { id: 10, name: "MELO PREMIUM", icon: <Crown size={28}/>, color: "text-yellow-400", req: "Premium Member", type: 'prem', min: 1 },
];

const Profile = () => {
  const { user, setUser, logout, loading: authLoading } = useAuth();
  const { isPlaying, togglePlay } = useMusic(); 
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [settings, setSettings] = useState({
    notifications: localStorage.getItem("arena_notifications") === "true",
    darkTheme: localStorage.getItem("theme") !== "light",
    stealth: user?.privacy?.stealth || false
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    avatar: user?.avatar || AVATAR_VAULT[0],
    location: { city: user?.location?.city || "" }
  });

  const currentRating = user?.rating || 1000;
  const userLevel = Math.floor(currentRating / 100);
  const userWins = user?.totalWins || 0;
  const progress = (currentRating % 100);

  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkTheme) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [settings.darkTheme]);

  const handleCopyPromo = () => {
    if (!user?.promoCode) return toast.error("Code not generated yet");
    navigator.clipboard.writeText(user.promoCode); 
    toast.success(`Recruit Code ${user.promoCode} copied!`, {
        icon: '🔥',
        style: { background: '#1e1b4b', color: '#fff', borderRadius: '15px', fontWeight: 'bold' }
    });
  };

  const handleUpdate = async () => {
    setLoading(true); 
    try {
      const response = await axiosInstance.put("/user/profile", {
        ...formData,
        privacy: { stealth: settings.stealth }
      });
      // Corrected: Unwrap response due to your axios interceptor returning response.data
      const updatedUser = response.success ? response.data : response;
      setUser(updatedUser);
      setIsEditing(false);
      toast.success("Matrix Synchronized");
    } catch (err) {
      toast.error("Sync Failed: " + (err.response?.data?.message || err.message));
    } finally { setLoading(false); }
  };

  if (authLoading) return <LoadingScreen />;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${settings.darkTheme ? 'bg-[#050810] text-white' : 'bg-slate-50 text-slate-900'} flex flex-col font-sans overflow-x-hidden pb-40`}>
      
      {/* 🛡️ TOP NAVIGATION */}
      <div className="fixed top-8 left-0 right-0 px-6 flex justify-between items-center z-[60]">
          <button onClick={() => navigate('/dashboard')} className={`p-3 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg active:scale-90 transition-transform ${settings.darkTheme ? 'bg-white/5' : 'bg-white/40'}`}>
            <ArrowLeft size={20} className={settings.darkTheme ? 'text-white' : 'text-slate-900'}/>
          </button>
          <div className="flex items-center gap-3">
            {user?.role === "ADMIN" && (
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[8px] font-black text-purple-500 uppercase tracking-widest leading-none mb-1">Status</span>
                    <span className="text-[10px] font-bold uppercase text-white">Founder Access</span>
                </div>
            )}
            <button onClick={() => setIsSettingsOpen(true)} className={`p-3 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg active:scale-90 transition-transform ${settings.darkTheme ? 'bg-white/5' : 'bg-white/40'}`}>
                <Settings size={20} className={settings.darkTheme ? 'text-white' : 'text-slate-900'}/>
            </button>
          </div>
      </div>

      {/* 👤 AVATAR HEADER */}
      <div className="relative h-80 bg-gradient-to-b from-purple-600/20 to-transparent flex items-center justify-center pt-10">
        <div className="relative mt-12">
          <motion.div whileHover={{ scale: 1.05 }} className="w-36 h-36 rounded-[3.5rem] bg-gradient-to-tr from-purple-600 to-blue-500 p-1.5 shadow-2xl relative z-10">
            <div className={`w-full h-full rounded-[3.2rem] overflow-hidden ${settings.darkTheme ? 'bg-[#0A0F1E]' : 'bg-white'}`}>
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </motion.div>
          <button onClick={() => setIsEditing(true)} className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-3.5 rounded-[1.5rem] shadow-2xl z-20 border-4 border-[#050810] active:scale-90 transition-transform">
            <Camera size={18} />
          </button>
        </div>
      </div>

      {/* 🆔 USER INFO */}
      <div className="text-center px-8 -mt-6 relative z-30">
        <div className="flex flex-col items-center">
            <h2 className={`text-4xl font-black uppercase italic leading-none flex items-center justify-center gap-2 ${settings.darkTheme ? 'text-white' : 'text-slate-900'}`}>
                {user?.name} {settings.stealth && <Eye size={18} className="text-cyan-500 animate-pulse" />}
            </h2>
            {user?.role === "ADMIN" && (
                <div className="mt-2 flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
                    <ShieldCheck size={12} className="text-purple-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-purple-400">Super Admin / CEO</span>
                </div>
            )}
        </div>
        
        <p className={`mt-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 ${settings.darkTheme ? 'text-slate-500' : 'text-slate-600'}`}>
          <MapPin size={10} className="text-purple-500" /> {user?.location?.city || "Global Arena"}
        </p>
        
        {/* XP PROGRESS */}
        <div className="flex flex-col items-center mt-6">
            <div className="flex justify-between w-full max-w-[200px] mb-2 px-1">
                <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Tier {Math.floor(userLevel / 5) + 1}</span>
                <span className={`text-[9px] font-black ${settings.darkTheme ? 'text-slate-500' : 'text-slate-600'}`}>{progress}/100 XP</span>
            </div>
            <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-purple-600 to-blue-400" />
            </div>
        </div>
      </div>

      {/* 📊 MINI STATS */}
      <div className="grid grid-cols-3 gap-3 px-6 mt-10">
        <MiniStat label="Matches" value={user?.totalMatches || 0} icon={<Zap size={16}/>} isDark={settings.darkTheme} />
        <MiniStat label="Victories" value={userWins} icon={<Trophy size={16}/>} isDark={settings.darkTheme} />
        <MiniStat label="ELO" value={currentRating} icon={<Star size={16}/>} isDark={settings.darkTheme} />
      </div>

      {/* 🛠️ ACTION LINKS */}
      <div className="px-6 mt-8 space-y-3">
        
        {/* ADMIN COMMAND CENTER LINK */}
        {user?.role === "ADMIN" && (
            <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => navigate('/melo-admin-portal')}
            className="p-5 rounded-[2.5rem] border border-red-500/20 bg-red-500/5 cursor-pointer flex items-center justify-between group active:scale-95 transition-all shadow-xl shadow-red-900/10"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 group-hover:rotate-12 transition-transform">
                        <Terminal size={20} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-red-500/60 uppercase tracking-widest">Authority Protocol</p>
                        <p className="text-sm font-black text-red-500 uppercase tracking-tighter">Command Center</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[8px] font-black uppercase text-red-500 animate-pulse bg-red-500/10 px-2 py-1 rounded">Active</span>
                    <ChevronRight size={18} className="text-red-500/40" />
                </div>
            </motion.div>
        )}

        {/* REFERRAL CODE */}
        <div className="p-1 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-[2.5rem] shadow-xl">
            <div className={`flex items-center justify-between p-5 rounded-[2.3rem] ${settings.darkTheme ? 'bg-[#0F172A]' : 'bg-white'}`}>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><Share2 size={20}/></div>
                    <div>
                        <p className={`font-black text-[9px] uppercase tracking-widest ${settings.darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Recruit Code</p>
                        <p className={`font-mono font-black text-lg tracking-tighter ${settings.darkTheme ? 'text-white' : 'text-slate-900'}`}>
                          {user?.promoCode || "--- ---"}
                        </p>
                    </div>
                </div>
                <button onClick={handleCopyPromo} className="px-5 py-3 bg-purple-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all">
                    Copy Code
                </button>
            </div>
        </div>

        <ProfileLink onClick={() => navigate('/wallet-history')} icon={<Wallet className="text-emerald-400"/>} label="Melo Wallet" value={`₹${user?.walletBalance?.toLocaleString() || 0}`} isPrimary isDark={settings.darkTheme} />

        <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setIsBadgesOpen(true)} className={`p-5 border rounded-[2.5rem] flex flex-col items-center text-center transition-all active:scale-95 ${settings.darkTheme ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="mb-2 p-3 bg-blue-500/10 rounded-2xl text-blue-400"><Medal size={22}/></div>
                <p className={`font-black text-[8px] uppercase tracking-widest ${settings.darkTheme ? 'text-slate-500' : 'text-slate-400'}`}>Honor Vault</p>
                <p className="font-black text-[10px] uppercase text-blue-400">View Badges</p>
            </button>
            <ProfileCard icon={<BellRing className="text-orange-400"/>} label="Arena Status" sub="System Online" isDark={settings.darkTheme} />
        </div>
        
        <ProfileLink icon={<ShieldCheck className="text-purple-400"/>} label="Security Protocol" value="Verified" isDark={settings.darkTheme} />
        <ProfileLink onClick={() => setIsSettingsOpen(true)} icon={<Info className="text-cyan-400"/>} label="Software Matrix" value="Build 2026.1.Elite" isDark={settings.darkTheme} />

        <button onClick={logout} className="w-full mt-6 p-6 rounded-[2.2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center gap-3 text-red-500 font-black text-[10px] uppercase tracking-[0.4em] active:scale-95 transition-all group">
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" /> Terminate Matrix
        </button>
      </div>

      {/* 🏅 HONOR VAULT MODAL */}
      <AnimatePresence>
        {isBadgesOpen && (
            <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsBadgesOpen(false)} className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[100]" />
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-x-0 bottom-0 h-[85vh] bg-[#0A0F1E] rounded-t-[3.5rem] p-10 z-[110] overflow-y-auto no-scrollbar border-t border-white/10">
                    <div className="flex justify-between items-center mb-10 px-2">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white text-gradient bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Honor Vault</h3>
                        <button onClick={() => setIsBadgesOpen(false)} className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10"><X/></button>
                    </div>

                    <div className="space-y-4">
                        {BADGE_VAULT.map((badge) => {
                            const isUnlocked = (badge.type === 'lvl' && userLevel >= badge.min) || 
                                               (badge.type === 'wins' && userWins >= badge.min) ||
                                               (badge.type === 'prem' && user?.isPremium);

                            return (
                                <div key={badge.id} className={`flex items-center justify-between p-6 rounded-[2.5rem] border transition-all ${isUnlocked ? 'bg-white/5 border-white/10' : 'bg-black/40 border-white/5 opacity-40 grayscale'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-3xl bg-white/5 ${isUnlocked ? badge.color : 'text-slate-600'}`}>
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm uppercase italic ${badge.type === 'prem' ? 'text-yellow-400' : 'text-white'}`}>{badge.name}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Requirement: {badge.req}</p>
                                        </div>
                                    </div>
                                    {isUnlocked ? <Check size={20} className="text-green-500" strokeWidth={3}/> : <Lock size={20} className="text-slate-700"/>}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* ⚙️ SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className={`fixed bottom-0 left-0 right-0 ${settings.darkTheme ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[4rem] p-10 z-[110] border-t border-black/5 dark:border-white/10 shadow-2xl shadow-black`}>
              <div className="w-12 h-1.5 bg-slate-500/20 rounded-full mx-auto mb-10" />
              <h3 className={`text-2xl font-black uppercase italic mb-8 tracking-tighter ${settings.darkTheme ? 'text-white' : 'text-slate-900'}`}>System Configuration</h3>
              <div className="space-y-4">
                  <SettingToggle icon={<Volume2 size={18}/>} label="Arena Audio" enabled={isPlaying} onToggle={togglePlay} isDark={settings.darkTheme} />
                  
                  <SettingToggle icon={<BellRing size={18}/>} label="Global Alerts" enabled={settings.notifications} onToggle={() => {
                      const newState = !settings.notifications;
                      setSettings({...settings, notifications: newState});
                      localStorage.setItem("arena_notifications", newState);
                      if(newState) Notification.requestPermission();
                  }} isDark={settings.darkTheme} />

                  <SettingToggle icon={settings.darkTheme ? <Moon size={18}/> : <Sun size={18}/>} label="Dark Protocol" enabled={settings.darkTheme} onToggle={() => setSettings({...settings, darkTheme: !settings.darkTheme})} isDark={settings.darkTheme} />
                  
                  <SettingToggle icon={<Eye size={18}/>} label="Privacy Stealth" enabled={settings.stealth} onToggle={() => {
                      if(!user?.isPremium && user?.role !== "ADMIN") return toast.error("Elite Stealth requires Premium Membership");
                      setSettings({...settings, stealth: !settings.stealth});
                  }} isDark={settings.darkTheme} />
              </div>
              <p className={`mt-8 text-center text-[9px] font-black uppercase tracking-[0.4em] ${settings.darkTheme ? 'text-slate-500' : 'text-slate-600'}`}>Melo Battle • Arena Version 2.6.Elite</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✍️ EDIT IDENTITY MODAL */}
      <AnimatePresence>
        {isEditing && (
            <div className="fixed inset-0 z-[200] flex flex-col justify-end">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditing(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} className={`relative ${settings.darkTheme ? 'bg-[#0F172A]' : 'bg-white'} rounded-t-[3.5rem] p-10 border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]`}>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className={`text-2xl font-black uppercase italic ${settings.darkTheme ? 'text-white' : 'text-slate-900'}`}>Recode Identity</h3>
                        <button onClick={() => setIsEditing(false)} className={`p-3 rounded-2xl ${settings.darkTheme ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}><X size={20}/></button>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-8 mb-4 no-scrollbar">
                        {AVATAR_VAULT.map((url) => (
                            <button key={url} onClick={() => setFormData({...formData, avatar: url})} className={`w-20 h-20 rounded-3xl flex-shrink-0 border-4 transition-all ${formData.avatar === url ? 'border-purple-600 scale-110 shadow-2xl shadow-purple-600/30' : 'border-transparent opacity-40'}`}>
                                <img src={url} alt="avatar" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    <div className="space-y-5 mb-10">
                        <InputGroup label="Warrior Alias" value={formData.name} onChange={(v) => setFormData({...formData, name: v})} isDark={settings.darkTheme} />
                        <InputGroup label="Home Territory" value={formData.location.city} onChange={(v) => setFormData({...formData, location: { city: v }})} isDark={settings.darkTheme} placeholder="e.g. Baripada" />
                    </div>

                    <button onClick={handleUpdate} disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 py-6 rounded-[2rem] text-white font-black uppercase shadow-2xl shadow-purple-900/40 active:scale-95 transition-all">
                        {loading ? "Re-coding matrix..." : "Save Identity"}
                    </button>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- SHARED COMPONENTS --- */

const MiniStat = ({ label, value, icon, isDark }) => (
    <div className={`border rounded-[2.5rem] p-5 flex flex-col items-center transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
      <div className="mb-3 p-3 bg-purple-500/10 rounded-2xl text-purple-500">{icon}</div>
      <span className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <span className={`text-xl font-black italic ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</span>
    </div>
);

const ProfileLink = ({ icon, label, value, onClick, isPrimary, isDark }) => (
  <motion.div whileTap={{ scale: 0.98 }} onClick={onClick} className={`flex items-center justify-between p-5 rounded-[2.5rem] border cursor-pointer transition-all ${isPrimary ? "bg-purple-600 text-white border-transparent shadow-xl" : (isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm")}`}>
    <div className="flex items-center gap-4">
      <div className={`p-4 rounded-3xl ${isPrimary ? 'bg-white/20' : 'bg-purple-500/10 text-purple-500'}`}>{icon}</div>
      <div>
        <p className={`font-black text-[9px] uppercase tracking-widest ${isPrimary ? 'text-white/60' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>{label}</p>
        <p className={`font-black text-base uppercase tracking-tighter ${isPrimary ? 'text-white' : (isDark ? 'text-white' : 'text-slate-900')}`}>{value}</p>
      </div>
    </div>
    <ChevronRight size={18} className={isPrimary ? 'opacity-40' : 'text-slate-400'} />
  </motion.div>
);

const ProfileCard = ({ icon, label, sub, isDark }) => (
    <div className={`p-5 border rounded-[2.5rem] flex flex-col items-center text-center transition-all ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="mb-2 p-3 bg-purple-500/10 rounded-2xl">{icon}</div>
        <p className={`font-black text-[8px] uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
        <p className={`font-black text-[10px] uppercase truncate w-full ${isDark ? 'text-white' : 'text-slate-900'}`}>{sub}</p>
    </div>
);

const SettingToggle = ({ icon, label, enabled, onToggle, isDark }) => (
    <div className={`flex items-center justify-between p-5 rounded-3xl border transition-all ${isDark ? 'bg-black/5 dark:bg-white/5 border-transparent dark:border-white/5' : 'bg-slate-200/50 border-slate-300'}`}>
        <div className="flex items-center gap-4">
            <div className="text-purple-500 p-2 bg-purple-500/10 rounded-xl">{icon}</div>
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{label}</span>
        </div>
        <button onClick={onToggle} className={`w-12 h-6 rounded-full relative transition-colors ${enabled ? 'bg-purple-600' : 'bg-slate-400 dark:bg-slate-700'}`}>
            <motion.div animate={{ x: enabled ? 26 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg" />
        </button>
    </div>
);

const InputGroup = ({ label, value, onChange, isDark, placeholder }) => (
    <div className="w-full">
        <label className={`text-[10px] font-black uppercase ml-4 mb-2 block tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-700'}`}>{label}</label>
        <input 
            className={`w-full p-6 rounded-3xl font-bold outline-none border transition-all ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-600 shadow-sm'}`} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            placeholder={placeholder}
        />
    </div>
);

const LoadingScreen = () => (
    <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      <p className="mt-6 text-[10px] font-black uppercase tracking -[0.5em] text-purple-600 animate-pulse tracking-widest">Syncing Matrix...</p>
    </div>
);

export default Profile;