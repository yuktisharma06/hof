"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ─────────────── PARTICLE BACKGROUND ─────────────── */
function ParticleField() {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; duration: number }[]
  >([]);

  useEffect(() => {
    const p = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
    }));
    setParticles(p);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `rgba(99, 102, 241, ${0.15 + Math.random() * 0.2})`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      {/* Gradient orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

/* ─────────────── FEATURE CARD ─────────────── */
const features = [
  {
    icon: "🧠",
    title: "AI Peer Matching",
    desc: "XGBoost-powered ranking finds your ideal practice partner based on skills, Elo, and learning style.",
    gradient: "from-indigo-500/20 to-violet-500/20",
  },
  {
    icon: "⚡",
    title: "Real-time Collaboration",
    desc: "Monaco-powered code editor with live cursor tracking, conflict-free syncing, and integrated chat.",
    gradient: "from-cyan-500/20 to-blue-500/20",
  },
  {
    icon: "📊",
    title: "Adaptive Roadmap",
    desc: "Bayesian Knowledge Tracing models your mastery per topic and dynamically adjusts your learning path.",
    gradient: "from-emerald-500/20 to-teal-500/20",
  },
  {
    icon: "🛡️",
    title: "Integrity Monitor",
    desc: "Isolation Forest detects anomalous patterns — typing speed, paste behavior, tab switching in real-time.",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
  {
    icon: "🔍",
    title: "Code Evaluation",
    desc: "AST parsing evaluates correctness, efficiency, and coding style with structured, actionable feedback.",
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    icon: "💬",
    title: "NLP Feedback",
    desc: "AI generates human-like post-session reviews with strengths, weaknesses, and improvement roadmaps.",
    gradient: "from-purple-500/20 to-fuchsia-500/20",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="glass-card p-6 cursor-default"
    >
      <div
        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-4`}
      >
        {feature.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        {feature.title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
    </motion.div>
  );
}

/* ─────────────── STATS ─────────────── */
const stats = [
  { value: "10K+", label: "Mock Interviews" },
  { value: "2.5K", label: "Active Users" },
  { value: "98%", label: "Match Accuracy" },
  { value: "4.8★", label: "Avg Rating" },
];

/* ─────────────── NAVBAR ─────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/5"
          : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">IM</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            InterviewMesh
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            How it Works
          </a>
          <Link
            href="/dashboard"
            className="btn-primary text-sm px-5 py-2 rounded-lg"
          >
            <span>Launch App →</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ─────────────── MAIN PAGE ─────────────── */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AnimatePresence>
      {mounted && (
        <div className="relative min-h-screen">
          <ParticleField />
          <Navbar />

          {/* ─── HERO ─── */}
          <section className="relative z-10 min-h-screen flex items-center justify-center px-6">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Powered by XGBoost, BKT & Isolation Forest
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
                  <span className="text-white">Practice Interviews</span>
                  <br />
                  <span className="gradient-text">with AI-Matched Peers</span>
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                  The first peer-to-peer mock interview platform with real ML —
                  adaptive roadmaps, intelligent matching, and code evaluation
                  that actually learns from your sessions.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Link
                    href="/dashboard"
                    className="btn-primary px-8 py-3.5 text-base rounded-xl"
                  >
                    <span>Start Practicing →</span>
                  </Link>
                  <Link
                    href="/session/demo"
                    className="btn-secondary px-8 py-3.5 text-base rounded-xl"
                  >
                    Try Live Demo
                  </Link>
                </motion.div>
              </motion.div>

              {/* Terminal preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="mt-16 glass rounded-2xl p-1 max-w-3xl mx-auto"
              >
                <div className="bg-[#0d0d20] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                    <span className="ml-2 text-xs text-slate-500">
                      interview_session.py
                    </span>
                  </div>
                  <div className="p-6 font-mono text-sm text-left">
                    <TypewriterCode />
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ─── STATS ─── */}
          <section className="relative z-10 py-16 border-y border-white/5">
            <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ─── FEATURES ─── */}
          <section id="features" className="relative z-10 py-24 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  ML-Powered, Not Rule-Based
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                  Every feature uses real machine learning models — not
                  hardcoded thresholds. Models improve as you practice.
                </p>
              </motion.div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((f, i) => (
                  <FeatureCard key={f.title} feature={f} index={i} />
                ))}
              </div>
            </div>
          </section>

          {/* ─── HOW IT WORKS ─── */}
          <section
            id="how-it-works"
            className="relative z-10 py-24 px-6 border-t border-white/5"
          >
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  How It Works
                </h2>
              </motion.div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Upload Resume",
                    desc: "Our NLP engine extracts your skills and suggests a personalized interview prep path.",
                  },
                  {
                    step: "02",
                    title: "Get Matched",
                    desc: "XGBoost ranks peers by skill complementarity, Elo proximity, and improvement trends.",
                  },
                  {
                    step: "03",
                    title: "Practice & Grow",
                    desc: "Code together in real-time, get AI feedback, and watch your mastery graph evolve.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className="relative"
                  >
                    <div className="text-6xl font-black text-indigo-500/10 mb-4">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* ─── CTA ─── */}
          <section className="relative z-10 py-24 px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center glass p-12 rounded-3xl relative overflow-hidden"
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(99,102,241,0.2), transparent 50%), radial-gradient(circle at bottom left, rgba(6,182,212,0.15), transparent 50%)",
                }}
              />
              <h2 className="text-3xl font-bold text-white mb-4 relative z-10">
                Ready to Level Up?
              </h2>
              <p className="text-slate-400 mb-8 relative z-10">
                Join thousands of engineers practicing with AI-matched peers.
              </p>
              <Link
                href="/dashboard"
                className="btn-primary px-10 py-4 text-base rounded-xl relative z-10 inline-block"
              >
                <span>Get Started Free →</span>
              </Link>
            </motion.div>
          </section>

          {/* ─── FOOTER ─── */}
          <footer className="relative z-10 border-t border-white/5 py-8 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">IM</span>
                </div>
                <span className="text-slate-500 text-sm">
                  InterviewMesh © 2026
                </span>
              </div>
              <div className="flex gap-6 text-sm text-slate-500">
                <span className="hover:text-slate-300 cursor-pointer transition-colors">
                  Privacy
                </span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors">
                  Terms
                </span>
                <a
                  href="https://github.com"
                  className="hover:text-slate-300 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── TYPEWRITER CODE EFFECT ─── */
function TypewriterCode() {
  const [visibleLines, setVisibleLines] = useState(0);
  const lines = [
    { text: "from", highlight: "interviewmesh", rest: " import PeerMatcher" },
    { text: "", highlight: "", rest: "" },
    {
      text: "matcher = PeerMatcher(",
      highlight: "model",
      rest: '="xgboost")',
    },
    {
      text: "peers = matcher.",
      highlight: "rank",
      rest: "(user=current_user)",
    },
    { text: "", highlight: "", rest: "" },
    { text: "# ", highlight: "Top match:", rest: " 94.2% compatibility" },
    { text: "# ", highlight: "Skills:", rest: " DP, Graphs, Trees" },
    { text: "# ", highlight: "Elo diff:", rest: " ±50 (ideal range)" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= lines.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [lines.length]);

  return (
    <div className="space-y-1">
      {lines.slice(0, visibleLines).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex"
        >
          <span className="text-slate-600 w-6 text-right mr-4 select-none">
            {i + 1}
          </span>
          {line.text === "" ? (
            <span>&nbsp;</span>
          ) : (
            <span>
              <span className="text-slate-400">{line.text}</span>
              <span className="text-indigo-400">{line.highlight}</span>
              <span className="text-slate-500">{line.rest}</span>
            </span>
          )}
        </motion.div>
      ))}
      {visibleLines < lines.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="inline-block w-2 h-4 bg-indigo-400 ml-10"
        />
      )}
    </div>
  );
}
