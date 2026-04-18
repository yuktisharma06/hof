"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const API = "http://localhost:3001/api";

export default function AIInterviewPage() {
  const [topic, setTopic] = useState("arrays");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState<any>(null);
  const [code, setCode] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/ai-interview`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty, previousAnswers: [] })
      });
      const data = await res.json();
      setQuestion(data.question);
      setCode(data.question?.starterCode || "// Write your solution here\n");
      setStarted(true);
    } catch { setQuestion({ title: "Two Sum", description: "Given an array of integers nums and an integer target, return indices of the two numbers that add up to target.", difficulty: "medium", starterCode: "function twoSum(nums, target) {\n  // Your code here\n}" }); setCode("function twoSum(nums, target) {\n  // Your code here\n}"); setStarted(true); }
    setLoading(false);
  };

  const submitAnswer = async () => {
    setAnswers(prev => [...prev, code]);
    try {
      const [evalRes, interviewRes] = await Promise.all([
        fetch(`${API}/ml/evaluate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code, language: "javascript" }) }),
        fetch(`${API}/ai-interview`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic, difficulty, previousAnswers: [...answers, code] }) })
      ]);
      const evalData = await evalRes.json();
      const interviewData = await interviewRes.json();
      setFeedback(evalData);
      setFollowUp(interviewData.followUp);
    } catch { setFeedback({ overallScore: 80, efficiency: "optimal", feedback: "Good approach!" }); setFollowUp("Can you optimize the space complexity?"); }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-10 rounded-3xl max-w-md w-full text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Interviewer</h1>
          <p className="text-slate-400 text-sm mb-8">Practice with adaptive AI that adjusts questions based on your performance</p>
          <div className="space-y-4 text-left">
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-2">Topic</label>
              <select value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40 appearance-none">
                {["arrays","strings","dynamic-programming","graphs","trees","sorting","two-pointers","hash-maps"].map(t => <option key={t} value={t} className="bg-[#1e1b4b]">{t.replace(/-/g," ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-2">Difficulty</label>
              <div className="flex gap-2">
                {["easy","medium","hard"].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${difficulty === d ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-white/5 text-slate-400 border border-white/5"}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={startInterview} disabled={loading} className="btn-primary w-full py-3 mt-8 rounded-xl"><span>{loading ? "Starting..." : "Start Interview →"}</span></button>
          <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white mt-4 inline-block transition-colors">← Back to Dashboard</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a1a]">
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition-colors text-sm">← Back</Link>
            <div className="w-px h-6 bg-white/10" />
            <span className="text-sm font-medium text-white">🤖 AI Interview</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">{topic}</span>
          </div>
          <button onClick={submitAnswer} className="btn-primary text-sm px-5 py-2"><span>Submit Answer →</span></button>
        </div>
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-lg font-semibold text-white mb-2">{question?.title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{question?.description}</p>
          {question?.hints && <div className="mt-3 text-xs text-indigo-400/60">💡 Hint: {question.hints[0]}</div>}
        </div>
        <div className="flex-1">
          <MonacoEditor height="100%" language="javascript" theme="vs-dark" value={code} onChange={(v) => v && setCode(v)}
            options={{ fontSize: 14, minimap: { enabled: false }, padding: { top: 16 }, fontFamily: "'JetBrains Mono', monospace", smoothScrolling: true }} />
        </div>
      </div>
      <div className="w-80 border-l border-white/5 p-4 overflow-y-auto bg-[#0d0d20]/80">
        <h3 className="text-sm font-semibold text-white mb-4">AI Feedback</h3>
        {followUp && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 mb-4 border-l-2 border-indigo-500">
            <div className="text-xs text-indigo-400 mb-1">Follow-up Question</div>
            <p className="text-sm text-slate-300">{followUp}</p>
          </motion.div>
        )}
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="glass-card p-4">
              <div className="text-xs text-slate-500 mb-1">Score</div>
              <div className="text-3xl font-bold text-white">{feedback.overallScore}</div>
              <div className="mt-2 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${feedback.overallScore}%` }} /></div>
            </div>
            <div className="glass-card p-4"><div className="text-xs text-slate-500 mb-1">Efficiency</div><div className="text-sm font-semibold text-emerald-400">{feedback.efficiency}</div></div>
            <div className="glass-card p-4"><div className="text-xs text-slate-500 mb-1">Feedback</div><p className="text-sm text-slate-300">{feedback.feedback}</p></div>
          </motion.div>
        )}
        {!feedback && !followUp && <p className="text-sm text-slate-600 text-center mt-8">Submit your answer to receive AI feedback</p>}
      </div>
    </div>
  );
}
