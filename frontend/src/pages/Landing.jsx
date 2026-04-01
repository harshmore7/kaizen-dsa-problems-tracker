import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useTheme } from "../ThemeContext";

const features = [
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Spaced Repetition",
    desc: "SM-2 algorithm schedules reviews exactly when you're about to forget. Never re-solve what you already know.",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: "XP & Levels",
    desc: "Earn XP for every problem solved. Daily streaks multiply your gains. Watch yourself level up.",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Monaco Editor",
    desc: "VS Code-quality code editor embedded per problem. Write, save and revisit solutions in 10 languages.",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: "Weakness Detector",
    desc: "Identifies topics where your solve rate is lowest. Tells you exactly where to focus next.",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Multi-platform",
    desc: "Track LeetCode, GFG, Codeforces, CodeChef and HackerRank problems in one unified dashboard.",
    color: "text-coral-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Rich Analytics",
    desc: "Activity heatmap, difficulty progression, solve rate by topic — everything visualized.",
    color: "text-teal-400",
    bg: "bg-teal-500/10 border-teal-500/20",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const { dark, toggle } = useTheme();

  useEffect(() => {
    api
      .get("/stats/")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar — minimal, no tab switcher */}
      <nav
        className="sticky top-0 z-50 border-b border-border backdrop-blur-md"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--bg-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span
              className="font-cal text-base tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Kaizen
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:opacity-80"
              style={{
                borderColor: "var(--bg-border)",
                color: "var(--text-secondary)",
              }}
            >
              {dark ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => navigate("/problems")}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              Open Dashboard →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          改善 — Continuous Improvement
        </div>

        {/* Headline */}
        <h1 className="font-cal text-5xl md:text-6xl text-white leading-tight mb-6">
          Track every problem.
          <br />
          <span className="text-green-400">Never forget a solution.</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A coding problem tracker built for serious competitive programmers.
          Spaced repetition, XP gamification, and deep analytics — all in one
          place.
        </p>

        {/* CTAs */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/problems")}
            className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all hover:scale-105 text-sm"
          >
            Start Tracking →
          </button>
          <button
            onClick={() => navigate("/analytics")}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-border rounded-xl transition-all text-sm"
          >
            View Analytics
          </button>
        </div>

        {/* Live stats */}
        {stats && (
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              {
                label: "Level",
                value: `Lvl ${stats.level}`,
                color: "text-green-400",
              },
              {
                label: "Current Streak",
                value: `${stats.streak} 🔥`,
                color: "text-amber-400",
              },
              {
                label: "Total XP",
                value: `${stats.xp} XP`,
                color: "text-purple-400",
              },
            ].map((s) => (
              <div key={s.label} className="glass rounded-xl p-4">
                <div className={`text-2xl font-bold ${s.color} mb-1`}>
                  {s.value}
                </div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-border" />
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-cal text-3xl text-white mb-3">
            Everything you need to improve
          </h2>
          <p className="text-gray-500 text-sm">
            Built for the grind. Designed to keep you consistent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className={`glass rounded-xl p-5 border ${f.bg} hover:scale-[1.02] transition-transform`}
            >
              <div className={`${f.color} mb-3`}>{f.icon}</div>
              {/* Change text-white to CSS var */}
              <div
                className="text-sm font-semibold mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {f.title}
              </div>
              <div
                className="text-xs leading-relaxed"
                style={{ color: "var(--text-muted)" }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
              <svg
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <span className="text-sm text-gray-500 font-cal">Kaizen</span>
          </div>
          <span className="text-xs text-gray-700">
            改善 — Continuous improvement
          </span>
        </div>
      </footer>
    </div>
  );
}
