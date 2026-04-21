import { io } from "socket.io-client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Send, ChevronLeft, Terminal, FileCode2, 
  Clock, CheckCircle2, XCircle, AlertTriangle, Code2, 
  RefreshCw, Check, X, ShieldAlert, Cpu, ShieldCheck 
} from "lucide-react";
import axiosInstance from "../../api/axios";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const LANGUAGE_VERSIONS = {
  c: "C (GCC 9.2.0)",
  cpp: "C++ (GCC 9.2.0)",
  java: "Java (OpenJDK 13.0.1)",
  python: "Python (3.8.1)"
};

const MONACO_LANGUAGES = {
  c: "c",
  cpp: "cpp",
  java: "java",
  python: "python"
};

const LiveCodingArena = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [contest, setContest] = useState(null);
  const [question, setQuestion] = useState(null);
  
  // Editor States
  const [language, setLanguage] = useState("python"); 
  const [codeMap, setCodeMap] = useState({});
  const [activeTab, setActiveTab] = useState("problem"); 
  
  // Execution States
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [compilerError, setCompilerError] = useState(false);
  // 🔥 OPPONENT STATES
const [opponent, setOpponent] = useState(null);
const [opponentStatus, setOpponentStatus] = useState("Waiting...");
const [opponentProgress, setOpponentProgress] = useState(0);

  // Timer & Analytics
  const [timeLeft, setTimeLeft] = useState("");
  const [isTimeUp, setIsTimeUp] = useState(false);
  const startTimeRef = useRef(Date.now()); 
  const isTimerTriggered = useRef(false); // Prevents double auto-submit

  // 🔥 STATE LOCKS FOR AUTO-SUBMIT: Prevents stale closures when timer hits 0
  const codeMapRef = useRef(codeMap);
  const languageRef = useRef(language);
  const socketRef = useRef(null);

  useEffect(() => {
    codeMapRef.current = codeMap;
    languageRef.current = language;
  }, [codeMap, language]);

  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        const response = await axiosInstance.get(`/contest/${id}`);
        const data = response?.data?.data || response?.data?.contest || response?.data || response;
        
        if (data) {
          setContest(data);
          
          if (data.isCompletedByUser) {
            toast.error("BATTLE ARCHIVED: ALREADY PARTICIPATED", { icon: '🛡️' });
            navigate(`/contest-leaderboard/${id}`);
            return;
          }

          if (data.questions && data.questions.length > 0) {
            const q = data.questions[0];
            setQuestion(q);
            setCodeMap({
              c: q.starterCode?.c || "#include <stdio.h>\n\nint main() {\n    // Write C code here\n    return 0;\n}",
              cpp: q.starterCode?.cpp || "#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write C++ code here\n    return 0;\n}",
              java: q.starterCode?.java || "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write Java code here\n    }\n}",
              python: q.starterCode?.python || "# Write Python code here\n"
            });
            startTimeRef.current = Date.now(); 
          } else {
            toast.error("No problem statement found in this arena.");
          }
        }
      } catch (error) {
        toast.error("Failed to sync arena data.");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchArenaData();
  }, [id, navigate]);

  useEffect(() => {
    if (!contest?.startTime || !contest?.duration) return;

    const timer = setInterval(() => {
      if (isTimerTriggered.current) return;

      const now = new Date().getTime();
      const start = new Date(contest.startTime).getTime();
      const end = start + (contest.duration * 60 * 1000);
      const remaining = end - now;

      if (remaining <= 0) {
        isTimerTriggered.current = true;
        setTimeLeft("00:00:00");
        setIsTimeUp(true);
        clearInterval(timer);
        toast.error("Time is up! Auto-submitting to Matrix...", { duration: 4000 });
        
        // Wait a tiny bit for UI to update before heavy network call
        setTimeout(() => {
          handleSubmit(true); 
        }, 500);

      } else {
        const h = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [contest]);

  useEffect(() => {
  socketRef.current = io("http://localhost:5000");

  socketRef.current.emit("join_battle", {
    contestId: id,
    userId: user?._id
  });

  socketRef.current.on("opponent_joined", (data) => {
    setOpponent(data);
  });

  socketRef.current.on("opponent_status", (data) => {
    setOpponentStatus(data.status);
  });

  socketRef.current.on("opponent_progress", (data) => {
    setOpponentProgress(data.progress);
  });

  socketRef.current.on("opponent_submitted", () => {
    toast("Opponent submitted 😳", { icon: "⚡" });
  });

  return () => socketRef.current.disconnect();
}, [id, user]);

const handleEditorChange = (value) => {
  setCodeMap(prev => ({ ...prev, [language]: value }));

  socketRef.current?.emit("typing", {
    contestId: id,
    status: "Typing..."
  });
};
  const handleRunCode = async () => {
    const currentLang = languageRef.current;
    const currentCode = codeMapRef.current[currentLang];

    if (!currentCode) return toast.error("Code cannot be empty");
    
    setIsCompiling(true);
    socketRef.current?.emit("run_code", {
  contestId: id,
  status: "Running code..."
});
    setActiveTab("output");
    setOutput("Compiling code securely in sandbox...");
    setCompilerError(false);

    try {
      const response = await axiosInstance.post("/compiler/run", {
        language: currentLang,
        sourceCode: currentCode,
        input: customInput
      });

      const res = response?.data || response;

      if (res?.success) {
        setOutput(res?.output || "Program executed successfully with no console output.");
        setCompilerError(res?.isError || false);
      } else {
        setOutput(res?.message || "Execution Failed. Please check your syntax.");
        setCompilerError(true);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err?.message || "Server Error during compilation.";
      setOutput(`Sandbox Execution Error:\n${errorMsg}`);
      setCompilerError(true);
    } finally {
      setIsCompiling(false);
    }
  };

  /**
   * 🔥 PARTIAL XP ROUTING PROTOCOL
   * Calculates score based on exactly how many test cases passed.
   */
  const routeToResults = (passedCount, totalCases, allPassed) => {
    const totalTimeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const safeTotalCases = totalCases > 0 ? totalCases : 1;
    const accuracy = Math.round((passedCount / safeTotalCases) * 100);
    
    // 1. Base Score = Percentage of test cases passed (e.g., 2/4 = 50 Points)
    let baseScore = Math.floor((passedCount / safeTotalCases) * 100);
    let timeBonus = 0;
    
    // 2. Speed Bonus ONLY applied if the code is 100% correct (Competitive Standard)
    if (allPassed) {
       const maxTime = contest?.duration ? contest.duration * 60 : 900; 
       const timeLeftSecs = Math.max(0, maxTime - totalTimeTaken);
       timeBonus = Math.floor((timeLeftSecs / 10) * 15); 
    }

    const finalScore = baseScore + timeBonus;

    navigate("/quiz-result", {
      state: {
        score: finalScore,
        totalQuestions: safeTotalCases, 
        correctAnswers: passedCount,
        accuracy: accuracy,
        contestId: id,
        timeTaken: `${totalTimeTaken}s`,
        timestamp: new Date().toISOString()
      },
      replace: true 
    });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    const currentLang = languageRef.current;
    const currentCode = codeMapRef.current[currentLang];

    // Auto-Submit Empty Code Guard
    if (!currentCode || currentCode.trim() === "") {
      if (isAutoSubmit) {
        routeToResults(0, 1, false);
        return;
      }
      return toast.error("Code cannot be empty");
    }
    
    setIsSubmitting(true);
    socketRef.current?.emit("submit_code", {
  contestId: id,
  status: "Submitted"
});
    setActiveTab("results");
    setTestResults(null);

    try {
      const response = await axiosInstance.post("/compiler/submit", {
        questionId: question._id,
        language: currentLang,
        sourceCode: currentCode
      });

      const res = response?.data || response;

      if (res?.success) {
        setTestResults(res);

        if (res?.allPassed) {
          toast.success("ALL TEST CASES PASSED! Outstanding!", { icon: '🏆', style: { background: '#050810', color: '#10B981', border: '1px solid #10B981' } });
          
          // Fully Correct: Wait 2.5s then redirect to result page
          setTimeout(() => {
            routeToResults(res.passedCount, res.totalCases, true);
          }, 2500);

        } else {
          // Partially Correct or Failed
          if (res?.passedCount > 0) {
            toast.success(`${res?.passedCount}/${res?.totalCases} Test Cases Passed. Partial XP Awarded.`, { icon: '🎯' });
          } else {
            toast.error("Execution Failed. 0 Test Cases Passed.");
          }
          
          // 🔥 Only force them out if Time is Up! Otherwise, let them try fixing the code.
          if (isAutoSubmit === true) {
            setTimeout(() => {
               routeToResults(res.passedCount, res.totalCases, false);
            }, 3000);
          }
        }
      } else {
        toast.error(res?.message || "Submission failed processing.");
        if (isAutoSubmit === true) {
          setTimeout(() => routeToResults(0, 1, false), 2000);
        }
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Submission Error.");
      if (isAutoSubmit === true) {
        setTimeout(() => routeToResults(0, 1, false), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndEarly = () => {
     if (window.confirm("Abort Live Coding Session? You will receive Partial/Zero XP.")) {
         routeToResults(0, 1, false);
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center text-purple-500 font-black tracking-widest uppercase">
        <Cpu size={48} className="animate-pulse mb-4" />
        Booting Sandbox Compiler...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white flex flex-col font-sans overflow-hidden h-screen">
      {/* 🚀 TOP NAVIGATION BAR */}
      <nav className="h-16 border-b border-white/10 bg-[#0A0F1E] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Code2 className="text-purple-500" size={20} />
            <h1 className="font-black text-sm uppercase tracking-widest text-slate-200 hidden md:block">
              {contest?.title || "Live Coding Arena"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest uppercase border ${isTimeUp ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
            <Clock size={12} /> {timeLeft}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleEndEarly}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 mr-2"
            >
              <XCircle size={14} /> End
            </button>

            <button 
              onClick={handleRunCode} 
              disabled={isCompiling || isSubmitting || isTimeUp}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              {isCompiling ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} className="text-emerald-400" />} Run Code
            </button>
            <button 
              onClick={() => handleSubmit(false)} 
              disabled={isCompiling || isSubmitting || isTimeUp}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />} Submit
            </button>
          </div>
        </div>
      </nav>
<div className="px-6 py-3 bg-[#0A0F1E] border-b border-white/10 flex items-center justify-between gap-6">

  {/* YOU */}
  <div className="flex-1">
    <div className="text-[10px] text-green-400 mb-1 font-bold">YOU</div>
    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
      <div
        className="bg-green-500 h-full"
        style={{
          width: `${((testResults?.passedCount || 0) / (testResults?.totalCases || 1)) * 100}%`
        }}
      />
    </div>
  </div>

  <div className="text-xs text-gray-400 font-bold">VS</div>

  {/* ENEMY */}
  <div className="flex-1">
    <div className="text-[10px] text-red-400 mb-1 font-bold">ENEMY</div>
    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
      <div
        className="bg-red-500 h-full"
        style={{ width: `${opponentProgress}%` }}
      />
    </div>
  </div>

</div>

      {/* 🚀 SPLIT SCREEN LAYOUT */}
     <div className="flex-1 flex overflow-hidden">
        
        {/* 📜 LEFT PANE: PROBLEM & CONSOLE */}
        <div className="w-full lg:w-[45%] flex flex-col border-r border-white/10 bg-[#0A0F1E]">
          {/* TABS */}
          <div className="flex border-b border-white/10 bg-[#050810] px-2 pt-2">
            <TabButton active={activeTab === "problem"} onClick={() => setActiveTab("problem")} icon={<FileCode2 size={14}/>} label="Problem" />
            <TabButton active={activeTab === "customInput"} onClick={() => setActiveTab("customInput")} icon={<Terminal size={14}/>} label="Custom Input" />
            <TabButton active={activeTab === "output"} onClick={() => setActiveTab("output")} icon={<Play size={14}/>} label="Output" />
            <TabButton active={activeTab === "results"} onClick={() => setActiveTab("results")} icon={<ShieldCheck size={14}/>} label="Test Results" />
          </div>

          {/* TAB CONTENT */}
          <div className="flex-1 overflow-y-auto p-6 no-scrollbar relative">
            
            {activeTab === "problem" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-white mb-2">{question?.title || "Coding Protocol"}</h2>
                  <div className="flex gap-2">
                     <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-3 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">Logic</span>
                     <span className="bg-purple-500/10 text-purple-400 text-[9px] font-black px-3 py-1 rounded border border-purple-500/20 uppercase tracking-widest">Points: {contest?.prizePool}</span>
                  </div>
                </div>
                
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {question?.problemStatement || "No problem statement provided."}
                </div>

                {question?.constraints && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertTriangle size={12}/> Constraints</p>
                    <pre className="text-xs text-amber-400 font-mono">{question.constraints}</pre>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "customInput" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Test Custom Logic</p>
                <textarea 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter inputs exactly as the code expects them..."
                  className="flex-1 w-full bg-[#050810] border border-white/10 rounded-xl p-4 text-slate-300 font-mono text-sm resize-none outline-none focus:border-purple-500/50 transition-colors"
                />
              </motion.div>
            )}

            {activeTab === "output" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution Matrix</p>
                  {isCompiling && <span className="text-[9px] text-purple-400 animate-pulse">Running in Sandbox...</span>}
                </div>
                <div className={`flex-1 w-full bg-[#050810] border rounded-xl p-5 font-mono text-sm overflow-auto ${compilerError ? 'border-red-500/30 text-red-400' : 'border-white/10 text-emerald-400'}`}>
                  {output ? <pre className="whitespace-pre-wrap">{output}</pre> : <span className="text-slate-600 italic">Run code to see output...</span>}
                </div>
              </motion.div>
            )}

            {activeTab === "results" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {!testResults && !isSubmitting && <div className="text-center text-slate-500 mt-10 font-bold uppercase text-xs tracking-widest">Submit code to see matrix results</div>}
                {isSubmitting && <div className="text-center text-purple-400 animate-pulse mt-10 font-bold uppercase text-xs tracking-widest">Validating Test Cases...</div>}
                
                {testResults && (
                  <>
                    <div className={`p-6 rounded-2xl border ${testResults.allPassed ? 'bg-emerald-500/10 border-emerald-500/30' : testResults.passedCount > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'} flex items-center justify-between`}>
                      <div>
                        <h3 className={`text-xl font-black uppercase tracking-tighter ${testResults.allPassed ? 'text-emerald-400' : testResults.passedCount > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                          {testResults.allPassed ? "System Accepted" : testResults.passedCount > 0 ? "Partial Completion" : "Validation Failed"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 font-bold tracking-widest uppercase">
                          Passed {testResults.passedCount} / {testResults.totalCases} cases
                        </p>
                      </div>
                      {testResults.allPassed ? <CheckCircle2 size={40} className="text-emerald-500" /> : <ShieldAlert size={40} className={testResults.passedCount > 0 ? "text-amber-500" : "text-red-500"} />}
                    </div>

                    <div className="space-y-2 mt-6">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Test Case Matrix</p>
                      {testResults.results?.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
                          <div className="flex items-center gap-3">
                            {r.passed ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-red-500" />}
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Case {r.testCase} {r.isHidden && <span className="text-slate-600 text-[9px]">(Hidden)</span>}</span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                            {r.time && <span>{r.time}s</span>}
                            {r.memory && <span>{r.memory}KB</span>}
                            <span className={`font-black uppercase tracking-widest ${r.passed ? 'text-emerald-500' : 'text-red-500'}`}>{r.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* 💻 RIGHT PANE: MONACO EDITOR */}
        {/* 💻 RIGHT PANE */}
<div className="w-full lg:w-[55%] flex">

  {/* ✅ EDITOR SECTION */}
  <div className="flex-1 flex flex-col bg-[#1E1E1E]">
    
    {/* Editor Header */}
    <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 justify-between">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Environment:
        </span>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-[#333] text-white text-xs font-black px-3 py-1 rounded"
        >
          {Object.entries(LANGUAGE_VERSIONS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="text-[9px] text-slate-500 uppercase font-black">
        ● Sandbox Active
      </div>
    </div>

    {/* Editor */}
    <div className="flex-1">
      <Editor
        height="100%"
        theme="vs-dark"
        language={MONACO_LANGUAGES[language]}
        value={codeMap[language]}
        onChange={handleEditorChange}
      />
    </div>
  </div>

  {/* ✅ OPPONENT PANEL */}
  <div className="w-[220px] bg-[#050810] border-l border-white/10 p-4 flex flex-col justify-between">

    <div>
      <h3 className="text-xs text-purple-400 mb-3 font-bold uppercase">
        Opponent
      </h3>

      {opponent ? (
        <>
          <div className="text-sm text-white font-semibold">
            {opponent.name || "Enemy"}
          </div>

          <div className="text-xs text-gray-400 mt-1">
            {opponentStatus}
          </div>

          <div className="mt-4">
            <div className="text-[10px] text-gray-500 mb-1">Progress</div>
            <div className="w-full bg-gray-800 h-2 rounded-full">
              <div
                className="bg-red-500 h-full"
                style={{ width: `${opponentProgress}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="text-xs text-gray-500">
          Waiting for opponent...
        </div>
      )}
    </div>

    <div className="text-[10px] text-red-400 animate-pulse">
      ⚡ Live Battle
    </div>

  </div>

</div>

      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all ${
      active ? 'bg-[#0A0F1E] text-purple-400 border-t border-l border-r border-white/10' : 'bg-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5 border-t border-l border-r border-transparent'
    }`}
  >
    {icon} {label}
  </button>
);

export default LiveCodingArena;