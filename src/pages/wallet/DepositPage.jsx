import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, PlusCircle, CreditCard, ShieldCheck, 
  ChevronRight, Zap 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { load } from '@cashfreepayments/cashfree-js';
import axiosInstance from "../../api/axios"; // Adjust path if your axios instance is located elsewhere
import { toast } from "react-hot-toast";

const DepositPage = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth(); // 🔥 Added refreshUser to update balance instantly
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [cashfree, setCashfree] = useState(null);

  // Compact selection for a professional look
  const quickAmounts = [10, 50, 100, 500];

  // Initialize Cashfree SDK on component mount
  useEffect(() => {
    const initializeSDK = async () => {
      const cashfreeInstance = await load({
        mode: "sandbox" // 🔥 Change this to "production" later when using real money
      });
      setCashfree(cashfreeInstance);
    };
    initializeSDK();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    
    // 🔥 Minimum check
    if (amount < 5) {
      toast.error("Minimum amount to add is ₹5");
      return;
    }
    
    setLoading(true);

    try {
      // Step 1: Create Order in Backend
      const orderRes = await axiosInstance.post('/payment/create-order', {
        amount: Number(amount),
        userId: user._id,
        userName: user.name || "Melo Warrior",
        userEmail: user.email || "warrior@melobattle.com",
        userPhone: "9999999999" // Cashfree requires a 10 digit number
      });

      const data = orderRes?.data || orderRes;

      if (data.success && data.paymentSessionId) {
        
        // Step 2: Open Cashfree Checkout Popup
        let checkoutOptions = {
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_modal", // Opens as a popup
        };

        cashfree.checkout(checkoutOptions).then(async (result) => {
          if (result.error) {
            toast.error("Payment cancelled or failed.");
            setLoading(false);
          }
          
          if (result.paymentDetails) {
            // Step 3: Payment Success! Verify with Backend
            toast.loading("Verifying transaction...", { id: "verify" });
            
            const verifyRes = await axiosInstance.post('/payment/verify', {
              orderId: data.orderId,
              userId: user._id
            });

            const verifyData = verifyRes?.data || verifyRes;

            if (verifyData.success) {
              // 🔥 CRITICAL: Update the global user state so the balance changes instantly
              await refreshUser(); 

              toast.success(`Successfully added ₹${amount} to your wallet!`, { id: "verify" });
              
              // Navigate back to wallet after a brief delay
              setTimeout(() => {
                navigate(-1);
              }, 1500);
            } else {
              toast.error("Verification failed.", { id: "verify" });
            }
            setLoading(false);
          }
        });

      } else {
        toast.error("Failed to initiate payment.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Deposit error:", error);
      toast.error("Server error during deposit.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans antialiased">
      {/* Slim Professional Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="p-1.5 hover:bg-slate-100 rounded-full transition-all active:scale-90"
        >
          <ArrowLeft size={20} className="text-slate-900" />
        </button>
        <h1 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Add Cash</h1>
      </div>

      <main className="p-4 max-w-md mx-auto space-y-4">
        
        {/* Compact Balance Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
              <PlusCircle size={20} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Current Wallet</p>
              <p className="text-base font-black text-slate-900 leading-none">₹{user?.walletBalance || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>
        </div>

        {/* Professional Small Input Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100"
        >
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Enter Amount (Min ₹5)</p>
            <div className="relative inline-flex items-center justify-center border-b border-slate-200 focus-within:border-purple-600 transition-all px-2 w-full max-w-[200px]">
              <span className="text-xl font-black text-slate-900 mr-1">₹</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                placeholder="0"
                className="w-full bg-transparent py-2 text-3xl font-black text-slate-900 outline-none placeholder:text-slate-200 text-center"
                required 
              />
            </div>
          </div>

          {/* Compact Chips */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt)}
                className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                  amount == amt 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md" 
                    : "bg-slate-50 border-slate-100 text-slate-500 hover:border-purple-200"
                }`}
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-center gap-2 border border-slate-100">
              <ShieldCheck className="text-emerald-500" size={14} />
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">
                Secure SSL • Instant Deposit
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading || !amount || !cashfree}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Proceed to Pay <ChevronRight size={14} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Subtle Branding */}
        <div className="text-center opacity-40">
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Melo Battle Payments</p>
        </div>
      </main>
    </div>
  );
};

export default DepositPage;