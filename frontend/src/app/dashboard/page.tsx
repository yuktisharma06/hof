"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell
} from "recharts";

const API = "http://localhost:3001/api";
const CURRENT_USER_ID = "usr_001";

const skillColors: Record<string, string> = {
  arrays: "#818cf8", strings: "#06b6d4", "dynamic-programming": "#f43f5e",
  graphs: "#10b981", trees: "#f59e0b", "linked-lists": "#8b5cf6",
  sorting: "#ec4899", backtracking: "#14b8a6", "two-pointers": "#6366f1",
  "sliding-window": "#a855f7", "hash-maps": "#22d3ee", greedy: "#fb923c",
  math: "#84cc16", "bit-manipulation": "#e879f9", recursion: "#38bdf8",
};

function Sidebar() {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊", active: true },
    { href: "/session/new", label: "New Session", icon: "⚡" },
    { href: "/matching", label: "Find Peers", icon: "🤝" },
    { href: "/ai-interview", label: "AI Interview", icon: "🤖" },
    { href: "/resume", label: "Resume Parser", icon: "📄" },
  ];
  return (
    <aside className="w-64 min-h-screen border-r border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl p-4 flex flex-col fixed left-0 top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
          <span className="text-white font-bold text-sm">IM</span>
        </div>
        <span className="text-white font-bold text-lg tracking-tight">InterviewMesh</span>
      </Link>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(l => (
          <Link key={l.href} href={l.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${l.active ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
            <span className="text-base">{l.icon}</span>{l.label}
          </Link>
        ))}
      </nav>
      <div className="glass-card p-4 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">A</div>
          <div><div className="text-sm font-semibold text-white">Aarav Patel</div><div className="text-xs text-slate-500">Elo 1450</div></div>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ label, value, change, icon }: { label: string; value: string; change: string; icon: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${change.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>{change}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [uRes, sRes] = await Promise.all([
          fetch(`${API}/users/${CURRENT_USER_ID}`), fetch(`${API}/sessions`)
        ]);
        const u = await uRes.json();
        const s = await sRes.json();
        setUser(u);
        setSessions(s.filter((x: any) => x.participants?.includes(CURRENT_USER_ID)));

        const rRes = await fetch(`${API}/ml/roadmap`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: CURRENT_USER_ID, skill_levels: u.skillLevels || {} })
        });
        setRoadmap(await rRes.json());
      } catch { /* fallback to empty */ }
      setLoading(false);
    }
    load();
  }, []);

  const progressData = [
    { week: "W1", score: 62 }, { week: "W2", score: 68 }, { week: "W3", score: 71 },
    { week: "W4", score: 75 }, { week: "W5", score: 73 }, { week: "W6", score: 80 },
    { week: "W7", score: 82 }, { week: "W8", score: 85 },
  ];

  const radarData = user ? Object.entries(user.skillLevels || {}).map(([k, v]) => ({
    topic: k.replace(/-/g, " "), value: Math.round((v as number) * 100)
  })) : [];

  const topicBarData = roadmap?.roadmap?.slice(0, 8).map((t: any) => ({
    topic: t.topic.replace(/-/g, " ").slice(0, 12), mastery: Math.round(t.mastery * 100),
    color: t.status === "weak" ? "#f43f5e" : t.status === "developing" ? "#f59e0b" : t.status === "strong" ? "#10b981" : "#818cf8"
  })) || [];

  if (loading) return (
    <div className="flex"><Sidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="grid grid-cols-4 gap-6 mb-8">{[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
        <div className="grid grid-cols-2 gap-6">{[1,2].map(i => <div key={i} className="skeleton h-80 rounded-xl" />)}</div>
      </main>
    </div>
  );

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 p-8 min-h-screen">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-slate-500">Here&apos;s your interview prep overview</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard icon="🔥" label="Day Streak" value={`${user?.streak || 0}`} change="+2" />
          <StatCard icon="📈" label="Sessions" value={`${user?.sessionsCompleted || 0}`} change="+3 this week" />
          <StatCard icon="⭐" label="Avg Rating" value={`${user?.avgRating || 0}`} change="+0.2" />
          <StatCard icon="🏆" label="Elo Rating" value={`${user?.elo || 0}`} change="+30" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Progress Over Time</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData}>
                <XAxis dataKey="week" stroke="#475569" fontSize={12} />
                <YAxis stroke="#475569" fontSize={12} domain={[50, 100]} />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={{ fill: "#818cf8", r: 4 }} activeDot={{ r: 6, fill: "#6366f1" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skill Radar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Mastery</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Topic Mastery Bars */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Topic Mastery Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topicBarData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#475569" fontSize={12} />
                <YAxis type="category" dataKey="topic" stroke="#475569" fontSize={11} width={100} />
                <Tooltip contentStyle={{ background: "#1e1b4b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                <Bar dataKey="mastery" radius={[0, 6, 6, 0]} barSize={20}>
                  {topicBarData.map((d: any, i: number) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Roadmap Suggestions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">🗺️ Learning Roadmap</h3>
            {roadmap?.nextTopic && (
              <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="text-xs text-indigo-400 font-medium mb-1">NEXT RECOMMENDED</div>
                <div className="text-white font-semibold capitalize">{roadmap.nextTopic.replace(/-/g, " ")}</div>
              </div>
            )}
            <div className="space-y-2">
              <div className="text-xs text-slate-500 font-medium uppercase mb-2">Weak Areas</div>
              {(roadmap?.weakAreas || []).slice(0, 4).map((t: string) => (
                <div key={t} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-slate-300 capitalize">{t.replace(/-/g, " ")}</span>
                </div>
              ))}
              <div className="text-xs text-slate-500 font-medium uppercase mt-4 mb-2">Strong Areas</div>
              {(roadmap?.strongAreas || []).slice(0, 4).map((t: string) => (
                <div key={t} className="flex items-center gap-2 text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-slate-300 capitalize">{t.replace(/-/g, " ")}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Session History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
            <Link href="/session/new" className="btn-primary text-sm px-4 py-2"><span>New Session →</span></Link>
          </div>
          <div className="space-y-3">
            {sessions.slice(0, 5).map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}
                className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${s.difficulty === "hard" ? "bg-rose-500/10" : s.difficulty === "medium" ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                    {s.difficulty === "hard" ? "🔴" : s.difficulty === "medium" ? "🟡" : "🟢"}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{s.topic}</div>
                    <div className="text-xs text-slate-500">{new Date(s.startedAt).toLocaleDateString()} · {Math.round(s.duration / 60)}min</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{s.feedback?.[CURRENT_USER_ID]?.score || "—"}%</div>
                    <div className="text-xs text-slate-500">Score</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "completed" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {s.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
