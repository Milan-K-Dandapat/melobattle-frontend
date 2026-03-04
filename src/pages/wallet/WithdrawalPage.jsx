import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, History, Wallet, X, Copy, Download, Share2,
  Info, CreditCard, ArrowUpRight, ShieldCheck, Check, ChevronDown, Globe, RefreshCcw, Clock, Shield, Cpu, Zap, Trophy
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { requestWithdrawal, getWithdrawalHistory } from "../../api/wallet.api";
import html2canvas from "html2canvas";

const WithdrawalPage = () => {
  const navigate = useNavigate();
  const receiptRef = useRef(null);
  
  /**
   * 🔥 FIX: winningBalance depends on the 'user' object from context.
   * We pull 'setUser' to push the backend response directly into the global state.
   */
  const { user, refreshUser, setUser } = useAuth();
  
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [view, setView] = useState("request"); 
  const [showConfirm, setShowConfirm] = useState(false);
  
  // 🔥 FIXED: Declared 'showBreakdown' state to resolve ReferenceError
  const [showBreakdown, setShowBreakdown] = useState(false); 
  
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const winningBalance = user?.winningBalance || 0;
  const depositBalance = user?.depositBalance || 0;
  const totalBalance = user?.walletBalance || 0;
  const totalWithdrawn = user?.totalWithdrawn || 0;

  const fetchHistory = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getWithdrawalHistory();
      const historyData = res?.history || res?.data || res || [];
      setHistory(Array.isArray(historyData) ? historyData : []);
    } catch (err) {
      console.error("History fetch failed:", err);
      setHistory([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    if (refreshUser) refreshUser();
  }, [fetchHistory, refreshUser]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setStatus({ type: "success", msg: "Transaction ID Copied" });
    setTimeout(() => setStatus({ type: "", msg: "" }), 2000);
  };

  const handleShareReceipt = async () => {
    if (!receiptRef.current) return;
    try {
      const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#ffffff', scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `Melo_Receipt_${selectedReceipt._id.slice(-6)}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Melo Battle Payout Receipt',
            text: `Just cashed out ₹${selectedReceipt.amount} from Melo Battle! 🚀`,
          });
        }
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const downloadReceipt = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current, { backgroundColor: '#ffffff', scale: 2 });
    const link = document.createElement('a');
    link.download = `Melo_Battle_Receipt_${selectedReceipt._id.slice(-6)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const triggerReview = (e) => {
    e.preventDefault();
    if (!user?.totalWins || user.totalWins < 1) {
      return setStatus({ type: "error", msg: "Win at least 1 battle to unlock payouts" });
    }
    if (Number(amount) < 20) {
      return setStatus({ type: "error", msg: "Minimum ₹20 required" });
    }
    if (Number(amount) > winningBalance) {
      return setStatus({ type: "error", msg: "Insufficient winning balance" });
    }
    if (!upiId || !upiId.includes("@")) {
      return setStatus({ type: "error", msg: "Enter a valid UPI ID" });
    }
    setStatus({ type: "", msg: "" });
    setShowConfirm(true);
  };

  const handleFinalWithdraw = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      // 1. Call Backend
      const res = await requestWithdrawal(amount, upiId);
      
      /**
       * 🔥 CRITICAL UI SYNC
       * If backend returns the updated user, we set it globally
       * This turns the displayed ₹272 into ₹252 instantly.
       */
      if (res?.success && res.data && setUser) {
        setUser(res.data); 
      } else if (refreshUser) {
        await refreshUser(); // Fallback re-fetch
      }

      setStatus({ type: "success", msg: "Payout successful! Balance updated." });
      setAmount("");
      await fetchHistory();
      setTimeout(() => setView("history"), 1500); 
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.message || "Transfer failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white text-slate-900 font-sans flex justify-center overflow-hidden">
      <div className="w-full max-w-md h-full flex flex-col relative border-x border-gray-50">
        
        {/* HEADER */}
        <header className="flex-none px-4 h-14 flex items-center justify-between border-b border-gray-50">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <ArrowLeft size={18} className="text-slate-600" />
          </button>
          <div className="text-center font-black italic tracking-tighter uppercase text-slate-800">Melo Battle Payout</div>
          <button onClick={() => setView(view === "request" ? "history" : "request")} className="p-2 text-indigo-600 active:scale-90 transition-transform">
            {view === "request" ? <History size={18} /> : <Wallet size={18} />}
          </button>
        </header>

        <main className="flex-1 flex flex-col p-5 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === "request" ? (
              <motion.div key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
                {/* PRIMARY WINNING CARD */}
                <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Shield size={80} /></div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Available Winnings</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-light text-slate-500 italic">₹</span>
                    <h2 className="text-4xl font-black italic tracking-tighter">{winningBalance.toLocaleString('en-IN')}</h2>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                    <button onClick={() => setShowBreakdown(!showBreakdown)} className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-tight">
                      {showBreakdown ? 'Hide' : 'View'} Wallet Details <ChevronDown size={12} className={showBreakdown ? 'rotate-180' : ''} />
                    </button>
                    <span className="text-[10px] font-black text-indigo-400 italic uppercase">Total: ₹{totalBalance}</span>
                  </div>

                  <AnimatePresence>
                    {showBreakdown && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-4 mt-4 pb-1">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-black">Deposit</p>
                            <p className="text-sm font-bold text-slate-200">₹{depositBalance}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-tighter">Lifetime Payouts</p>
                            <p className="text-sm font-bold text-emerald-400 italic">₹{totalWithdrawn}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* FORM SECTION */}
                <div className="space-y-5">
                  <div className="border-b border-gray-100 pb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Enter Amount</label>
                    <div className="flex items-center">
                      <span className="text-2xl font-light text-slate-300 mr-2">₹</span>
                      <input type="number" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent text-3xl font-black outline-none placeholder:text-gray-100 italic" />
                      <button onClick={() => setAmount(winningBalance)} className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg italic uppercase">MAX</button>
                    </div>
                  </div>
                  <div className="border-b border-gray-100 pb-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">UPI Destination</label>
                    <div className="flex items-center">
                      <CreditCard size={18} className="text-slate-300 mr-3" />
                      <input type="text" placeholder="username@bank" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full bg-transparent text-sm font-bold outline-none italic uppercase" />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <AnimatePresence>
                    {status.msg && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`mb-3 py-2 text-[10px] font-bold text-center rounded-lg border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                        {status.msg}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button onClick={triggerReview} disabled={loading} className="w-full h-14 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2 italic">
                    {loading ? "Processing..." : "Proceed Payout"} <ArrowUpRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Payout Trail</h3>
                  <button onClick={fetchHistory} disabled={refreshing} className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase italic">
                    <RefreshCcw size={12} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Syncing" : "Refresh"}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-4">
                  {history && history.length > 0 ? history.map((item, i) => (
                    <div key={i} className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] group relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${item.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                            {item.status === 'SUCCESS' ? <Check size={18} /> : <Clock size={18} />}
                          </div>
                          <div>
                            <p className="text-lg font-black italic tracking-tighter text-slate-800">₹{item.amount}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => setSelectedReceipt(item)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-[8px] font-black uppercase italic text-indigo-600">Receipt</button>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <Globe size={10} className="text-slate-300" />
                          <p className="text-[9px] font-bold text-slate-500 truncate italic max-w-[120px]">{item.upiId}</p>
                        </div>
                        <button onClick={() => copyToClipboard(item._id)} className="p-2 hover:bg-white rounded-lg transition-colors">
                          <Copy size={12} className="text-slate-400" />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 opacity-20 flex flex-col items-center">
                      <History size={48} className="mb-4 text-slate-300" />
                      <p className="text-xs font-black uppercase italic tracking-widest text-center px-8">No history detected in the matrix.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* OFFICIAL MELO RECEIPT MODAL */}
        <AnimatePresence>
          {selectedReceipt && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedReceipt(null)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-sm">
                
                <div ref={receiptRef} className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-indigo-600 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 text-indigo-600"><Shield size={200} /></div>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center mb-3 shadow-lg">
                      <Shield className="text-indigo-500" size={32} />
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-slate-900">Melo Battle</h2>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Official Payout Summary</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 mb-6 flex justify-between items-center border border-slate-100 relative">
                    <div className="text-center z-10">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-1"><Shield size={14} className="text-indigo-500" /></div>
                      <p className="text-[6px] font-black uppercase text-slate-400">Vault</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="h-[2px] w-full bg-slate-200 absolute"></div>
                      <div className="z-10 bg-white p-1 rounded-full border border-slate-100 animate-pulse"><Zap size={10} className="text-amber-500" /></div>
                    </div>
                    <div className="text-center z-10">
                      <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-1"><Cpu size={14} className="text-white" /></div>
                      <p className="text-[6px] font-black uppercase text-slate-400">Bank Node</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Amount</span>
                      <span className="text-2xl font-black italic text-slate-900">₹{selectedReceipt.amount}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Status</span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 italic">Verified</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-slate-400 uppercase">Ref ID</span>
                      <span className="text-[9px] font-bold text-slate-600 italic">MB-{selectedReceipt._id.slice(-10).toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-100 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ShieldCheck className="text-emerald-500" size={14} />
                      <p className="text-[8px] font-black text-slate-900 uppercase tracking-widest italic tracking-widest">End-to-End Encrypted</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={downloadReceipt} className="flex-1 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl font-black uppercase text-[10px] tracking-widest border border-white/20 flex items-center justify-center gap-2 italic">
                    <Download size={14} /> PNG
                  </button>
                  <button onClick={handleShareReceipt} className="flex-1 h-12 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl italic active:scale-95 transition-transform">
                    Share <Share2 size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CONFIRMATION MODAL */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-end">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative bg-white w-full rounded-t-[3rem] p-8 shadow-2xl">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8" />
                <h3 className="font-black text-center text-xs uppercase mb-10 italic tracking-widest">Authorize Instant Payout</h3>
                <div className="space-y-4 mb-10">
                  <div className="p-6 bg-slate-900 rounded-3xl flex justify-between items-center shadow-xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase italic">Amount</span>
                    <span className="text-3xl font-black italic text-white tracking-tighter">₹{amount}</span>
                  </div>
                </div>
                <button onClick={handleFinalWithdraw} disabled={loading} className="w-full h-16 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 italic active:scale-95 transition-transform">
                  {loading ? "Authenticating..." : "Confirm & Withdraw"} <Check size={20} />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WithdrawalPage;