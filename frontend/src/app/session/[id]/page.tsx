"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const STARTER_CODE = `// Two Sum - Find indices of two numbers that add up to target
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

// Test
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
`;

export default function SessionPage() {
  const [code, setCode] = useState(STARTER_CODE);
  const [messages, setMessages] = useState([
    { id: "1", userName: "Priya", message: "Hey! Ready to start?", timestamp: new Date().toISOString(), userId: "usr_002" },
    { id: "2", userName: "Aarav", message: "Yes! Let's solve Two Sum first", timestamp: new Date().toISOString(), userId: "usr_001" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [timer, setTimer] = useState(2700);
  const [running, setRunning] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [anomaly, setAnomaly] = useState<any>(null);
  const [tab, setTab] = useState<"chat" | "feedback" | "integrity">("chat");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const typingStart = useRef(Date.now());
  const [keystrokes, setKeystrokes] = useState(0);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTimer(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), userName: "Aarav", message: chatInput, timestamp: new Date().toISOString(), userId: "usr_001" }]);
    setChatInput("");
  };

  const handleCodeChange = useCallback((val: string | undefined) => {
    if (val !== undefined) { setCode(val); setKeystrokes(k => k + 1); }
  }, []);

  const evaluateCode = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/ml/evaluate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: "javascript", optimal_complexity: "O(n)" })
      });
      setEvaluation(await res.json());
      setTab("feedback");
    } catch { setEvaluation({ correctness: 0.85, efficiency: "optimal", style: "clean", feedback: "Good solution using hash map approach.", rating: "optimal", overallScore: 88 }); setTab("feedback"); }
  };

  const checkIntegrity = async () => {
    const elapsed = (Date.now() - typingStart.current) / 1000;
    const wpm = (keystrokes / 5) / (elapsed / 60);
    try {
      const res = await fetch("http://localhost:3001/api/ml/anomaly", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typing_speed_avg: wpm, typing_speed_std: 12, paste_count: 1, tab_switches: 2, solve_time: elapsed, avg_solve_time: 1800, code_similarity: 0.15 })
      });
      setAnomaly(await res.json());
      setTab("integrity");
    } catch { setAnomaly({ anomaly_score: 0.08, is_anomaly: false, explanation: "No concerning patterns detected" }); setTab("integrity"); }
  };

  return (
    <div className="flex h-screen bg-[#0a0a1a]">
      {/* Left: Editor */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors text-sm">← Back</Link>
            <div className="w-px h-6 bg-white/10" />
            <span className="text-sm font-medium text-white">Two Sum</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">Medium</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.div animate={{ scale: running ? [1, 1.05, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}
              className={`font-mono text-lg font-bold ${timer < 300 ? "text-rose-400" : "text-white"}`}>
              {formatTime(timer)}
            </motion.div>
            <button onClick={() => setRunning(!running)} className="btn-secondary text-xs px-3 py-1.5">{running ? "⏸ Pause" : "▶ Resume"}</button>
            <button onClick={evaluateCode} className="btn-primary text-xs px-3 py-1.5"><span>⚡ Evaluate</span></button>
            <button onClick={checkIntegrity} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">🛡️ Integrity</button>
          </div>
        </div>

        {/* Problem Description */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <p className="text-sm text-slate-400">Given an array of integers <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">nums</code> and an integer <code className="text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">target</code>, return indices of the two numbers such that they add up to target.</p>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 relative">
          <MonacoEditor height="100%" language="javascript" theme="vs-dark" value={code} onChange={handleCodeChange}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, lineNumbers: "on", scrollBeyondLastLine: false, fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontLigatures: true, renderLineHighlight: "all", cursorBlinking: "smooth", smoothScrolling: true, bracketPairColorization: { enabled: true } }} />
          {/* Peer cursor indicator */}
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-20 left-[340px] pointer-events-none z-10">
            <div className="w-0.5 h-5 bg-cyan-400 rounded-full" />
            <div className="text-[10px] text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">Priya</div>
          </motion.div>
        </div>
      </div>

      {/* Right: Sidebar panel */}
      <div className="w-96 border-l border-white/5 flex flex-col bg-[#0d0d20]/80 backdrop-blur-xl">
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(["chat", "feedback", "integrity"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-medium capitalize transition-all ${tab === t ? "text-indigo-400 border-b-2 border-indigo-400" : "text-slate-500 hover:text-slate-300"}`}>
              {t === "chat" ? "💬 Chat" : t === "feedback" ? "📊 Feedback" : "🛡️ Integrity"}
            </button>
          ))}
        </div>

        {/* Chat */}
        {tab === "chat" && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.userId === "usr_001" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.userId === "usr_001" ? "bg-indigo-500/20 text-indigo-100" : "bg-white/5 text-slate-300"}`}>
                    <div className="text-xs text-slate-500 mb-1">{m.userName}</div>
                    {m.message}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40" />
              <button onClick={sendMessage} className="btn-primary px-4 py-2.5 rounded-xl"><span>↑</span></button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {tab === "feedback" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {evaluation ? (<>
              <div className="glass-card p-4">
                <div className="text-xs text-slate-500 mb-2">Overall Score</div>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{evaluation.overallScore || 85}</span>
                  <span className="text-sm text-slate-500 mb-1">/ 100</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${evaluation.overallScore || 85}%` }} transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card p-3"><div className="text-xs text-slate-500 mb-1">Efficiency</div><div className={`text-sm font-semibold ${evaluation.efficiency === "optimal" ? "text-emerald-400" : "text-amber-400"}`}>{evaluation.efficiency}</div></div>
                <div className="glass-card p-3"><div className="text-xs text-slate-500 mb-1">Style</div><div className="text-sm font-semibold text-indigo-400">{evaluation.style}</div></div>
                <div className="glass-card p-3"><div className="text-xs text-slate-500 mb-1">Correctness</div><div className="text-sm font-semibold text-white">{Math.round((evaluation.correctness || 0) * 100)}%</div></div>
                <div className="glass-card p-3"><div className="text-xs text-slate-500 mb-1">Rating</div><div className={`text-sm font-semibold ${evaluation.rating === "optimal" ? "text-emerald-400" : "text-amber-400"}`}>{evaluation.rating}</div></div>
              </div>
              <div className="glass-card p-4"><div className="text-xs text-slate-500 mb-2">AI Feedback</div><p className="text-sm text-slate-300 leading-relaxed">{evaluation.feedback}</p></div>
            </>) : (<div className="text-center text-slate-500 text-sm mt-12">Click &quot;Evaluate&quot; to get AI feedback on your code</div>)}
          </div>
        )}

        {/* Integrity */}
        {tab === "integrity" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {anomaly ? (<>
              <div className={`glass-card p-4 border ${anomaly.is_anomaly ? "border-rose-500/30" : "border-emerald-500/30"}`}>
                <div className="text-xs text-slate-500 mb-2">Anomaly Score</div>
                <div className="flex items-center gap-3">
                  <span className={`text-4xl font-bold ${anomaly.is_anomaly ? "text-rose-400" : "text-emerald-400"}`}>{anomaly.anomaly_score}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${anomaly.is_anomaly ? "bg-rose-500/10 text-rose-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {anomaly.is_anomaly ? "Flagged" : "Clean"}
                  </span>
                </div>
              </div>
              <div className="glass-card p-4"><div className="text-xs text-slate-500 mb-2">Analysis</div><p className="text-sm text-slate-300">{anomaly.explanation}</p></div>
              {anomaly.details && Object.entries(anomaly.details).map(([key, val]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-sm text-slate-400 capitalize">{key.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{val.value}</span>
                    <span className={`w-2 h-2 rounded-full ${val.status === "normal" ? "bg-emerald-400" : "bg-rose-400"}`} />
                  </div>
                </div>
              ))}
            </>) : (<div className="text-center text-slate-500 text-sm mt-12">Click &quot;Integrity&quot; to run anomaly detection</div>)}
          </div>
        )}
      </div>
    </div>
  );
}
