import { useState, useEffect } from "react";
import api from "../api";
import ProblemRow from "../components/ProblemRow";
import ProblemModal from "../components/ProblemModal";
import ReviewBanner from "../components/ReviewBanner";

const PLATFORMS = [
  "all",
  "leetcode",
  "gfg",
  "codeforces",
  "codechef",
  "hackerrank",
  "other",
];
const DIFF = ["all", "easy", "medium", "hard"];
const STATUSES = ["all", "unsolved", "solved", "revision"];

const platLabel = {
  leetcode: "LC",
  gfg: "GFG",
  codeforces: "CF",
  codechef: "CC",
  hackerrank: "HR",
  other: "?",
};
const platColor = {
  leetcode: "text-orange-400 bg-orange-400/10",
  gfg: "text-green-400 bg-green-400/10",
  codeforces: "text-blue-400 bg-blue-400/10",
  codechef: "text-amber-400 bg-amber-400/10",
  hackerrank: "text-emerald-400 bg-emerald-400/10",
  other: "text-gray-400 bg-gray-400/10",
};

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    topic: "",
    difficulty: "all",
    status: "all",
    platform: "all",
  });

  const fetchProblems = async () => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.topic) params.topic = filters.topic;
    if (filters.difficulty !== "all") params.difficulty = filters.difficulty;
    if (filters.status !== "all") params.status = filters.status;
    if (filters.platform !== "all") params.platform = filters.platform;
    const res = await api.get("/problems/", { params });
    setProblems(res.data);
    setLoading(false);
  };

  useEffect(() => {
    api.get("/topics/").then((r) => setTopics(r.data));
  }, []);
  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
  const handleSave = () => {
    setModalOpen(false);
    setEditing(null);
    fetchProblems();
  };
  const handleEdit = (p) => {
    setEditing(p);
    setModalOpen(true);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this problem?")) return;
    await api.delete(`/problems/${id}/`);
    fetchProblems();
  };

  const handleStatus = async (id, newStatus) => {
    if (newStatus === "solved") {
      const res = await api.post(`/problems/${id}/mark_solved/`);
      if (res.data.xp_earned > 0) {
        window.dispatchEvent(
          new CustomEvent("kaizen:xp", { detail: { xp: res.data.xp_earned } }),
        );
        showToast(`+${res.data.xp_earned} XP`);
      }
    } else if (newStatus === "revision") {
      await api.post(`/problems/${id}/revise/`);
      window.dispatchEvent(new CustomEvent("kaizen:xp", { detail: { xp: 2 } }));
      showToast("+2 XP");
    } else {
      await api.patch(`/problems/${id}/`, { status: newStatus });
    }
    fetchProblems();
  };

  const solved = problems.filter((p) => p.status === "solved").length;
  const revision = problems.filter((p) => p.status === "revision").length;
  const unsolved = problems.filter((p) => p.status === "unsolved").length;
  const pct =
    problems.length > 0 ? Math.round((solved / problems.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-cal text-2xl text-white mb-1">Problems</h1>
          <p className="text-sm text-gray-500">
            Track your progress across all platforms
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors glow-green"
        >
          <span className="text-base leading-none">+</span> Add Problem
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Total solved",
            value: `${pct}%`,
            sub: `${solved} of ${problems.length}`,
            color: "text-green-400",
            bar: true,
          },
          { label: "Solved", value: solved, color: "text-green-400" },
          { label: "Revision", value: revision, color: "text-amber-400" },
          { label: "Unsolved", value: unsolved, color: "text-red-400" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <div className={`text-2xl font-bold ${s.color} mb-1`}>
              {s.value}
            </div>
            <div className="text-xs text-gray-500">{s.label}</div>
            {s.sub && (
              <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
            )}
            {s.bar && (
              <div className="mt-3 bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Review Banner */}
      <ReviewBanner onReviewed={fetchProblems} />

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
            width="13"
            height="13"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            className="bg-panel border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-gray-300 w-52 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all placeholder:text-gray-600"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
        </div>
        {[
          {
            key: "platform",
            opts: PLATFORMS,
            label: (p) => (p === "all" ? "Platform" : platLabel[p] || p),
          },
          {
            key: "difficulty",
            opts: DIFF,
            label: (d) => (d === "all" ? "Difficulty" : d),
          },
          {
            key: "status",
            opts: STATUSES,
            label: (s) => (s === "all" ? "Status" : s),
          },
        ].map((f) => (
          <select
            key={f.key}
            className="bg-panel border border-border rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-green-500/50 transition-all cursor-pointer"
            value={filters[f.key]}
            onChange={(e) => setFilter(f.key, e.target.value)}
          >
            {f.opts.map((o) => (
              <option key={o} value={o}>
                {f.label(o)}
              </option>
            ))}
          </select>
        ))}
        <select
          className="bg-panel border border-border rounded-lg px-3 py-2 text-sm text-gray-400 focus:outline-none focus:border-green-500/50 transition-all cursor-pointer"
          value={filters.topic}
          onChange={(e) => setFilter("topic", e.target.value)}
        >
          <option value="">All Topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <span className="ml-auto self-center text-xs text-gray-600 font-mono">
          {problems.length} problems
        </span>
      </div>

      {/* Table */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_88px_80px_160px_96px_120px] px-5 py-3 border-b border-border">
          {["Problem", "Platform", "Difficulty", "Topics", "Status", ""].map(
            (h) => (
              <span
                key={h}
                className="text-[11px] font-medium text-gray-600 uppercase tracking-wider"
              >
                {h}
              </span>
            ),
          )}
        </div>

        {loading && (
          <div className="py-16 text-center">
            <div className="inline-block w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          </div>
        )}
        {!loading && problems.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-3xl mb-3">🌱</div>
            <div className="text-gray-500 text-sm">No problems yet.</div>
            <div className="text-gray-600 text-xs mt-1">
              Add your first one to get started.
            </div>
          </div>
        )}
        {!loading &&
          problems.map((p, i) => (
            <ProblemRow
              key={p.id}
              problem={p}
              index={i}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatus}
              platColor={platColor}
              platLabel={platLabel}
            />
          ))}
      </div>

      {/* Modal */}
      <ProblemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSave={handleSave}
        topics={topics}
        editing={editing}
      />

      {/* XP Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-black text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <span>⚡</span> {toast}
        </div>
      )}
    </div>
  );
}
