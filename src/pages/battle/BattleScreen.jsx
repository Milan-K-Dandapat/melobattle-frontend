import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, Trophy, Zap, X, Target, 
  Flame, BarChart3, ShieldCheck, Activity, Clock
} from "lucide-react";
import axiosInstance from "../../api/axios"; 
import { toast } from "react-hot-toast";

const BattleScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Arena State Matrix
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10); // Question Timer
  const [totalTimeLeft, setTotalTimeLeft] = useState(0); // 🔥 Admin Total Timer
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [shake, setShake] = useState(false);

  // Time Tracking for Analytics
  const startTimeRef = useRef(Date.now());

  /**
   * ⚡ HAPTIC ENGINE
   */
  const triggerHaptic = (type) => {
    if (!window.navigator.vibrate) return;
    type === "ERROR" ? window.navigator.vibrate([100, 50, 100]) : window.navigator.vibrate(40);
  };

  // 1. ARENA INITIALIZATION (Manual JSON Sync Integrated)
  useEffect(() => {
    const startBattle = async () => {
      try {
        setIsSyncing(true);
        // 🔥 TARGET SYNC: Fetching questions stored directly in the Contest document
        const response = await axiosInstance.get(`/contest/battle/${id}`);
        
        // Robust extraction for the updated { questions, duration, title, isCompletedByUser } object
        const result = response?.data?.data || response?.data || response;
        
        // 🚨 SECURITY GUARD: Block access if user already played
        if (result?.isCompletedByUser) {
          toast.error("BATTLE ARCHIVED: ALREADY PARTICIPATED", { icon: '🛡️' });
          navigate(`/contest-leaderboard/${id}`);
          return;
        }

        if (result?.questions && result.questions.length > 0) {
          setQuestions(result.questions);
          
          // 🔥 SYNC: Convert Admin Minutes from the contest document to Total Seconds
          const adminDuration = result.duration || 15; 
          setTotalTimeLeft(adminDuration * 60); 
          
          toast.success("ARENA SYNCED", { icon: '🛡️' });
        } else {
          throw new Error("Question matrix empty. Check manual JSON upload.");
        }
      } catch (err) {
        console.error("🔥 Battle Sync Failure:", err);
        toast.error(err.response?.data?.message || "Arena Sync Failed. Retiring to dashboard.");
        navigate('/dashboard');
      } finally {
        setIsSyncing(false);
      }
    };
    
    if (id) startBattle();
  }, [id, navigate]);

  // 2. PRECISION CHRONOMETER (10-Second Question Timer)
  useEffect(() => {
    if (timeLeft > 0 && !isGameOver && questions.length > 0 && selectedOption === null) {
      const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 0.1)), 100);
      return () => clearInterval(timer);
    } else if (timeLeft <= 0 && !isGameOver && selectedOption === null && !isSyncing && questions.length > 0) {
      handleAnswer(-1); // Timeout Triggered
    }
  }, [timeLeft, isGameOver, questions.length, selectedOption, isSyncing]);

  // 🔥 3. ADMIN TOTAL SESSION ENFORCER
  useEffect(() => {
    if (totalTimeLeft > 0 && !isGameOver && !isSyncing) {
      const sessionTimer = setInterval(() => {
        setTotalTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(sessionTimer);
            finalizeArenaSession(); // 🚨 FORCE CLOSE: Admin time is up
            toast.error("TIME EXPIRED!", { icon: '⏰' });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(sessionTimer);
    }
  }, [totalTimeLeft, isGameOver, isSyncing]);

  // 4. COMBAT LOGIC: SCORING & STREAKS
  const handleAnswer = (optionIndex) => {
    if (selectedOption !== null || isGameOver || questions.length === 0) return;
    
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === questions[currentIndex].correctAnswer;
    
    if (isCorrect) {
      const timeBonus = Math.floor(timeLeft * 15);
      const comboMultiplier = combo >= 3 ? 1.5 : 1;
      const pointsWon = Math.floor((100 + timeBonus) * comboMultiplier);
      
      setScore((prev) => prev + pointsWon);
      setCombo((prev) => prev + 1);
      setCorrectAnswers((prev) => prev + 1);
      triggerHaptic("SUCCESS");
      
      toast.success(`+${pointsWon} XP`, { 
        id: 'score-pop',
        style: { background: '#10b981', color: '#fff', fontWeight: '900', borderRadius: '15px' }
      });
    } else {
      setCombo(0);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      triggerHaptic("ERROR");
      
      toast.error(optionIndex === -1 ? "TIME DEPLETED" : "STRIKE CRITICAL", { 
        id: 'score-pop',
        style: { background: '#ef4444', color: '#fff', fontWeight: '900', borderRadius: '15px' }
      });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setTimeLeft(10);
        setSelectedOption(null);
      } else {
        finalizeArenaSession();
      }
    }, 1000);
  };

  // 5. RESULT DISPATCH
  const finalizeArenaSession = async () => {
    if (isGameOver) return; 
    setIsGameOver(true);
    const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const accuracy = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    
    navigate("/quiz-result", {
      state: {
        score,
        totalQuestions: questions.length,
        correctAnswers,
        accuracy,
        contestId: id,
        timeTaken: `${totalTimeTaken}s`,
        timestamp: new Date().toISOString()
      }
    });
  };

  if (isSyncing) return <BattleLoader />;
  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <motion.div 
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      className="min-h-[100dvh] bg-[#050810] text-white flex flex-col p-3 sm:p-4 md:p-6 relative overflow-hidden"
    >
      {/* 🌌 Cyber Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* 🛡️ ARENA HUD */}
      <header className="relative z-10 flex justify-between items-center mb-4 md:mb-8">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dashboard')} 
          className="p-2.5 sm:p-3 md:p-4 bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all shrink-0"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
        </motion.button>
        
        {/* 🔥 ADMIN TOTAL TIME HUD */}
        <div className="bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 mx-1 sm:mx-2">
           <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
           <span className="text-[10px] sm:text-xs font-black tabular-nums">
             {Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}
           </span>
        </div>

        <div className="flex gap-1.5 sm:gap-2 md:gap-3 shrink-0">
          <div className="bg-white/5 backdrop-blur-xl px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] border border-white/10 flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="p-1 sm:p-1.5 bg-amber-500/20 rounded-md sm:rounded-lg">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500" />
            </div>
            <span className="font-black italic text-sm sm:text-base md:text-xl tracking-tighter">{score.toLocaleString()}</span>
          </div>
          <AnimatePresence>
            {combo >= 2 && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-gradient-to-r from-orange-500 to-red-600 px-2 py-1.5 sm:px-3 sm:py-2 md:px-5 md:py-3 rounded-xl sm:rounded-2xl md:rounded-[1.5rem] flex items-center gap-1 sm:gap-1.5 md:gap-2 shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-white/10"
              >
                <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 animate-pulse" fill="white" />
                <span className="font-black italic text-xs sm:text-sm md:text-base">x{combo}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 🚀 PROGRESS BAR */}
      <div className="relative z-10 mb-4 sm:mb-6 md:mb-12">
        <div className="flex justify-between items-end mb-2 sm:mb-3 px-1">
           <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Combat Progress</span>
           <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">{currentIndex + 1} / {questions.length}</span>
        </div>
        <div className="w-full h-1.5 sm:h-2 md:h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
          <motion.div 
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", damping: 20 }}
          />
        </div>
      </div>

      {/* 🎯 COMBAT ZONE */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        
        {/* NEON CHRONOMETER */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mb-4 sm:mb-6 md:mb-12 shrink-0">
          <svg viewBox="0 0 128 128" className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(147,51,234,0.3)]">
            <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            <motion.circle 
              cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
              strokeDasharray="364.4"
              animate={{ strokeDashoffset: 364.4 - (364.4 * timeLeft) / 10 }}
              className={timeLeft < 3 ? 'text-red-500' : 'text-purple-500'}
              transition={{ ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-[-2px] md:mb-[-4px]">Sec</span>
            <span className={`font-black text-2xl sm:text-3xl md:text-4xl italic tracking-tighter ${timeLeft < 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {Math.ceil(timeLeft)}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl text-center flex-1 flex flex-col justify-center"
          >
            <h2 className="text-lg sm:text-xl md:text-3xl font-black mb-4 sm:mb-6 md:mb-12 leading-[1.2] md:leading-[1.1] uppercase italic tracking-tighter px-2 md:px-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">
              {currentQ?.text}
            </h2>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:gap-4 w-full max-w-md mx-auto px-1">
              {currentQ?.options?.map((option, idx) => (
                <OptionButton 
                  key={idx}
                  index={idx}
                  text={option}
                  isSelected={selectedOption === idx}
                  isCorrect={idx === currentQ.correctAnswer}
                  showResult={selectedOption !== null}
                  onClick={() => handleAnswer(idx)}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="relative z-10 mt-4 sm:mt-6 md:mt-auto pt-4 md:pt-8 flex items-center justify-between border-t border-white/5 pb-2 md:pb-0 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">
           <Activity className="w-3 h-3 md:w-3.5 md:h-3.5 text-purple-500"/> Arena Online
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-widest italic text-slate-500">
           <ShieldCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-cyan-500"/> Session Authorized
        </div>
      </footer>
    </motion.div>
  );
};

const OptionButton = ({ text, index, onClick, isSelected, isCorrect, showResult }) => {
  const letters = ['A', 'B', 'C', 'D'];
  let borderColor = "border-white/10";
  let bgColor = "bg-white/5 shadow-xl shadow-black/20";
  let textColor = "text-slate-300";

  if (showResult) {
    if (isCorrect) {
      borderColor = "border-emerald-500";
      bgColor = "bg-emerald-500/20";
      textColor = "text-emerald-400";
    } else if (isSelected && !isCorrect) {
      borderColor = "border-red-500";
      bgColor = "bg-red-500/20";
      textColor = "text-red-400";
    }
  } else if (isSelected) {
    borderColor = "border-purple-500";
    bgColor = "bg-purple-500/20";
    textColor = "text-white";
  }

  return (
    <motion.button
      whileTap={!showResult ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={showResult}
      className={`group w-full p-3.5 sm:p-4 md:p-6 rounded-2xl md:rounded-[2rem] border-2 ${borderColor} ${bgColor} flex justify-between items-center transition-all duration-300`}
    >
      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 shrink-0 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs border ${showResult && isCorrect ? 'bg-emerald-500 border-transparent text-white' : 'bg-white/5 border-white/10 text-slate-500'}`}>
          {letters[index]}
        </div>
        <span className={`text-xs sm:text-sm md:text-base font-black uppercase tracking-tight text-left ${textColor}`}>
          {text}
        </span>
      </div>
      {showResult && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 ml-2">
          {isCorrect ? <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-emerald-500" /> : isSelected ? <X className="w-5 h-5 md:w-6 md:h-6 text-red-500" /> : null}
        </motion.div>
      )}
    </motion.button>
  );
};

const BattleLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] overflow-hidden relative p-4">
    <div className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/5 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
    <div className="relative mb-8 md:mb-10">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-16 h-16 md:w-24 md:h-24 border-4 border-purple-600/20 rounded-full" />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-16 h-16 md:w-24 md:h-24 border-4 border-purple-600 border-t-transparent rounded-full absolute top-0" />
      <div className="absolute inset-0 flex items-center justify-center"><Target className="w-6 h-6 md:w-8 md:h-8 text-purple-600 animate-pulse" /></div>
    </div>
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-purple-500 animate-pulse">Initializing Combat Area</p>
    </div>
  </div>
);

export default BattleScreen;