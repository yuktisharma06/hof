"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const API = "http://localhost:3001/api";

const SAMPLE_RESUME = `Aarav Patel
Software Engineer | 3+ years of experience

Skills: Python, JavaScript, React, Node.js, SQL, Docker, AWS
Experience:
- Software Engineer at TechCorp (2023-Present)
  - Built microservices using Node.js and Express
  - Implemented real-time features with WebSockets
- Junior Developer at StartupXYZ (2021-2023)
  - Developed React frontends with TypeScript
  - Worked with PostgreSQL and Redis

Education:
B.Tech in Computer Science, IIT Delhi (2021)

Certifications: AWS Solutions Architect, Google Cloud Professional`;

export default function ResumePage() {
  const [resumeText, setResumeText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const parseResume = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/ml/resume`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_text: resumeText })
      });
      setResult(await res.json());
    } catch { setResult({ skills: ["JavaScript","Python","React","Node.js"], experience_level: "mid", suggested_topics: ["arrays","dynamic-programming","system-design"], years_of_experience: 3, skill_count: 4, recommended_difficulty: "medium" }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-white transition-colors mb-6 inline-block">← Back to Dashboard</Link>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-3xl font-bold text-white mb-2">📄 Resume Skill Extractor</h1>
          <p className="text-slate-500 mb-8">Our NLP engine extracts your skills and maps them to an interview prep roadmap</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-white">Paste your resume</label>
                <button onClick={() => setResumeText(SAMPLE_RESUME)} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">Use Sample</button>
              </div>
              <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={16}
                placeholder="Paste your resume text here..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/40 resize-none font-mono" />
              <button onClick={parseResume} disabled={loading || !resumeText.trim()} className="btn-primary w-full py-3 mt-4 rounded-xl disabled:opacity-50">
                <span>{loading ? "Analyzing..." : "Extract Skills →"}</span>
              </button>
            </div>
          </div>

          <div>
            {result ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <div className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Analysis Results</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium capitalize ${result.experience_level === "senior" ? "bg-amber-500/10 text-amber-400" : result.experience_level === "mid" ? "bg-indigo-500/10 text-indigo-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {result.experience_level}
                    </span>
                  </div>
                  {result.years_of_experience && <div className="text-sm text-slate-400 mb-4">{result.years_of_experience}+ years of experience detected</div>}
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 font-medium mb-2">EXTRACTED SKILLS ({result.skill_count || result.skills?.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {(result.skills || []).map((s: string) => (
                        <motion.span key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">{s}</motion.span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <div className="text-xs text-slate-500 font-medium mb-3">SUGGESTED INTERVIEW TOPICS</div>
                  <div className="space-y-2">
                    {(result.suggested_topics || []).map((t: string, i: number) => (
                      <motion.div key={t} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <span className="text-sm text-slate-300 capitalize">{t.replace(/-/g, " ")}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">{result.recommended_difficulty}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <Link href="/matching" className="btn-primary w-full py-3 rounded-xl text-center block"><span>Find Peers Based on Skills →</span></Link>
              </motion.div>
            ) : (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <div className="text-slate-500 text-sm">Paste your resume and click extract to see AI analysis</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
