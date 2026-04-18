"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = "http://localhost:3001/api";

const topics = [
  { id: "arrays", label: "Arrays", icon: "📊", color: "indigo" },
  { id: "strings", label: "Strings", icon: "🔤", color: "cyan" },
  { id: "dynamic-programming", label: "Dynamic Programming", icon: "🧩", color: "rose" },
  { id: "graphs", label: "Graphs", icon: "🕸️", color: "emerald" },
  { id: "trees", label: "Trees", icon: "🌳", color: "amber" },
  { id: "sorting", label: "Sorting", icon: "📈", color: "purple" },
  { id: "two-pointers", label: "Two Pointers", icon: "👈👉", color: "teal" },
  { id: "hash-maps", label: "Hash Maps", icon: "🗺️", color: "blue" },
];

export default function NewSessionPage() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  const createSession = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/sessions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic || "arrays", difficulty, participants: ["usr_001"] })
      });
      const session = await res.json();
      router.push(`/session/${session.id}`);
    } catch { router.push("/session/demo"); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors mb-6 inline-block">← Back to Dashboard</Link>
        <div className="glass p-8 rounded-3xl">
          <h1 className="text-2xl font-bold text-white mb-2">⚡ New Practice Session</h1>
          <p className="text-slate-500 text-sm mb-8">Choose a topic and difficulty to start coding</p>

          <div className="mb-6">
            <label className="text-xs text-slate-500 font-medium block mb-3">SELECT TOPIC</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topics.map(t => (
                <motion.button key={t.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setSelectedTopic(t.id)}
                  className={`p-3 rounded-xl text-left transition-all ${selectedTopic === t.id ? "bg-indigo-500/15 border-indigo-500/30 border" : "bg-white/[0.03] border border-white/5 hover:border-white/10"}`}>
                  <div className="text-xl mb-1">{t.icon}</div>
                  <div className="text-xs font-medium text-white">{t.label}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-xs text-slate-500 font-medium block mb-3">DIFFICULTY</label>
            <div className="flex gap-3">
              {[{ id: "easy", label: "Easy", color: "emerald" }, { id: "medium", label: "Medium", color: "amber" }, { id: "hard", label: "Hard", color: "rose" }].map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)}
                  className={`flex-1 py-3 rounded-xl text-sm font-medium capitalize transition-all ${difficulty === d.id ? `bg-${d.color}-500/15 border-${d.color}-500/30 border text-${d.color}-400` : "bg-white/[0.03] border border-white/5 text-slate-400"}`}>{d.label}</button>
              ))}
            </div>
          </div>

          <button onClick={createSession} disabled={creating} className="btn-primary w-full py-3.5 rounded-xl text-base"><span>{creating ? "Creating..." : "Start Session →"}</span></button>
        </div>
      </motion.div>
    </div>
  );
}
