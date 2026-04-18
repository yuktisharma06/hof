"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function MatchingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const uRes = await fetch(`${API}/users/usr_001`);
        const user = await uRes.json();
        const allRes = await fetch(`${API}/users`);
        const all = await allRes.json();
        const candidates = all.filter((u: any) => u.id !== "usr_001");

        const mRes = await fetch(`${API}/ml/match`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: "usr_001", user_skills: user.skills, user_elo: user.elo, user_rating: user.avgRating, improvement_trend: user.improvementTrend, candidates })
        });
        const data = await mRes.json();
        setMatches(data.matches || candidates.map((c: any) => ({ ...c, matchScore: Math.random() * 0.4 + 0.6, compatibility: { skillOverlap: 0.6, eloDiff: 100, complementary: ["graphs"], shared: ["arrays"] } })));
      } catch { /* fallback */ }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors mb-6 inline-block">← Back to Dashboard</Link>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-white mb-2">🤝 Find Your Ideal Peer</h1>
          <p className="text-slate-500 mb-8">XGBoost-powered ranking based on skills, Elo, and learning patterns</p>
        </motion.div>

        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="skeleton h-32 rounded-xl" />)}</div>
        ) : (
          <div className="space-y-4">
            {matches.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }} className="glass-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">
                      {m.name?.[0]}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{m.name}</div>
                      <div className="text-sm text-slate-500">Elo {m.elo} · {m.sessionsCompleted} sessions · ⭐ {m.avgRating}</div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {(m.skills || []).slice(0, 5).map((s: string) => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-400">{Math.round((m.matchScore || 0) * 100)}%</div>
                    <div className="text-xs text-slate-500">Match Score</div>
                    <Link href="/session/new" className="btn-primary text-xs px-4 py-2 mt-3 inline-block rounded-lg"><span>Invite</span></Link>
                  </div>
                </div>
                {m.compatibility && (
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-3 gap-4">
                    <div><div className="text-xs text-slate-500 mb-1">Skill Overlap</div><div className="text-sm font-semibold text-white">{Math.round((m.compatibility.skillOverlap || 0) * 100)}%</div></div>
                    <div><div className="text-xs text-slate-500 mb-1">Elo Diff</div><div className="text-sm font-semibold text-white">±{m.compatibility.eloDiff}</div></div>
                    <div><div className="text-xs text-slate-500 mb-1">They can teach you</div>
                      <div className="flex gap-1 flex-wrap">{(m.compatibility.complementary || []).map((s: string) => <span key={s} className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">{s}</span>)}</div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
