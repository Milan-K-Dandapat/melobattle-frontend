import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import { googleLogin } from "../../api/auth.api";

// Context & Components
import { useAuth } from "../../context/AuthContext"; 
import ParticlesBackground from "../../components/ParticlesBackground";
import TermsModal from "../../components/TermsModal";
import MusicPlayer from "../../components/MusicPlayer"; 

const Login = () => {
  const [accepted, setAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refCode, setRefCode] = useState(null); 
  const [promoCode, setPromoCode] = useState("");

  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth(); 

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("ref");
    if (code) {
      setRefCode(code);
      console.log("🎯 Referral Detected:", code);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install: Tap your browser menu and select 'Add to Home Screen' 📲");
    }
  };

  const handleLogin = async () => {
    setLoading(true); 
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await googleLogin(idToken, promoCode);

      if (response.success) {
        login(response.data); 
        navigate("/intro"); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Changed bg-black to bg-transparent to ensure ParticlesBackground is visible */
    <div className="relative flex items-center justify-center h-screen px-4 md:px-6 overflow-hidden bg-transparent">
      {/* Background container to ensure it stays behind content */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground />
      </div>
      
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
        <MusicPlayer variant="login" />

        {/* 📲 DOWNLOAD BUTTON */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleInstallClick}
          className="absolute top-6 left-6 z-[100] bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-2 rounded-full text-[10px] font-black text-white flex items-center gap-2 shadow-xl active:scale-90 transition-transform hover:bg-white/20"
        >
          <span className="text-sm">📲</span> DOWNLOAD APP
        </motion.button>

        <div className="relative z-10 grid md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl w-full py-4 md:py-16">
          
          {/* LEFT SIDE: Stats & Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center md:text-left"
          >
            <motion.h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mt-2 md:mt-6 text-white uppercase italic tracking-tighter">
              MELO <span className="text-purple-600">BATTLE</span>
            </motion.h1>

            <p className="mt-2 md:mt-6 text-sm md:text-xl text-gray-300 max-w-md mx-auto md:mx-0">
              Compete in real-time skill battles. Win rewards. Rise in leaderboard.
            </p>

            <div className="mt-4 md:mt-12 grid grid-cols-3 text-center text-white">
              <div>
                <h3 className="text-lg md:text-3xl font-bold text-purple-400">
                  <CountUp end={12000} duration={3} />+
                </h3>
                <p className="text-gray-400 text-[10px] md:text-base uppercase tracking-widest font-bold">Players</p>
              </div>
              <div>
                <h3 className="text-lg md:text-3xl font-bold text-emerald-400">
                  ₹<CountUp end={250000} duration={3} />
                </h3>
                <p className="text-gray-400 text-[10px] md:text-base uppercase tracking-widest font-bold">Prize Paid</p>
              </div>
              <div>
                <h3 className="text-lg md:text-3xl font-bold text-orange-400">
                  <CountUp end={98} duration={3} />%
                </h3>
                <p className="text-gray-400 text-[10px] md:text-base uppercase tracking-widest font-bold">Fair Play</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Login Action */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="glass p-6 md:p-10 relative bg-white/10 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] border border-white/20 shadow-2xl"
          >
            <h2 className="text-2xl md:text-3xl font-black mb-2 md:mb-4 text-center text-white uppercase italic tracking-tighter leading-none">Welcome Back 🎮</h2>
            
            {refCode && (
              <div className="mb-3 md:mb-4 bg-purple-600/20 border border-purple-500/50 p-2 md:p-3 rounded-2xl text-center">
                  <p className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest animate-pulse">Referral Bonus Active: ₹10 Reward Ready</p>
              </div>
            )}

            <div className="flex items-start gap-2 md:gap-3 mt-4 md:mt-6 text-[10px] md:text-xs text-gray-300 bg-black/40 p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] border border-white/5">
              <input
                type="checkbox"
                id="terms"
                checked={accepted}
                onChange={() => setAccepted(!accepted)}
                className="mt-0.5 md:mt-1 accent-purple-600 cursor-pointer h-4 w-4 md:h-5 md:w-5 rounded-lg"
              />
              <label htmlFor="terms" className="cursor-pointer leading-tight md:leading-relaxed">
                I authorize the synchronization of my identity and agree to the{" "}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    setShowTerms(true);
                  }}
                  className="text-purple-400 cursor-pointer underline font-bold"
                >
                  Arena Terms & Conditions
                </span>
              </label>
            </div>

            <div className="mt-4 md:mt-6">
              <label className="text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest ml-2 mb-1 md:mb-2 block">Promo Code (Optional)</label>
              <input 
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white font-bold outline-none focus:border-purple-500 transition-all text-sm md:text-base"
                placeholder="ENTER RECRUIT CODE"
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={!accepted || loading}
              className={`mt-6 md:mt-8 w-full py-4 md:py-5 rounded-[1.2rem] md:rounded-[1.5rem] font-black text-base md:text-lg transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 ${
                accepted && !loading
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-purple-900/40"
                  : "bg-gray-800 text-white/30 cursor-not-allowed border border-white/5"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3 text-sm md:text-base">
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 md:border-3 border-white/20 border-t-white rounded-full animate-spin" />
                  SYNCING IDENTITY...
                </span>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 md:w-5 md:h-5" alt="G" />
                  <span className="text-sm md:text-lg">CONTINUE WITH GOOGLE</span>
                </div>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
};

export default Login;