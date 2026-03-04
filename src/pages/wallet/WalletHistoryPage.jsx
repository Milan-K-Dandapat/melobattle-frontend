import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, History, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { getWithdrawalHistory } from "../../api/wallet.api";

const WalletHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getWithdrawalHistory();
        // 🔥 SYNC: Ensuring we extract the array regardless of how your backend wraps it
        const historyData = res?.history || res?.data || res || [];
        setHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err) {
        console.error("History fetch failed");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-500 mb-6 md:mb-8 font-bold hover:text-purple-600 transition-colors text-sm md:text-base"
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Back to Lobby
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 flex items-center gap-2 md:gap-3 tracking-tighter uppercase">
            <History className="text-purple-600 w-6 h-6 md:w-8 md:h-8" /> Transaction History
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12 md:py-20 font-bold text-slate-400 italic text-sm md:text-base">
            Loading records...
          </div>
        ) : history.length > 0 ? (
          <div className="space-y-3 md:space-y-4">
            {history.map((item) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-row items-center justify-between hover:border-purple-100 transition-all gap-2"
              >
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl shrink-0 ${item.status === 'COMPLETED' || item.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {item.status === 'COMPLETED' || item.status === 'SUCCESS' ? <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" /> : <Clock className="w-4 h-4 sm:w-6 sm:h-6" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 uppercase text-xs sm:text-sm tracking-tight truncate">
                      Withdrawal to {item.upiId || 'UPI'}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 sm:mt-1 truncate">
                      {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className={item.status === 'COMPLETED' || item.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}>{item.status}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-base sm:text-xl font-black text-slate-900 tracking-tighter">₹{item.amount}</p>
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest">Payout</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-16 text-center border-2 border-dashed border-slate-200">
            <p className="font-bold text-slate-400 uppercase text-[10px] sm:text-xs tracking-[0.1em] sm:tracking-[0.2em]">
              No transactions yet. Start winning to see records here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletHistoryPage;