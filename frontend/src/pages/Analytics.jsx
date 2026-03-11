import { useState, useEffect } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ── Heatmap ──────────────────────────────────────────────────────────────────
function HeatCell({ count, date }) {
  const bg =
    count === 0
      ? "#1a1a1a"
      : count === 1
        ? "#14532d"
        : count === 2
          ? "#166534"
          : count === 3
            ? "#15803d"
            : "#22c55e";
  return (
    <div
      title={`${date}: ${count} problem${count !== 1 ? "s" : ""}`}
      style={{
        width: 11,
        height: 11,
        background: bg,
        borderRadius: 2,
        flexShrink: 0,
      }}
    />
  );
}

function Heatmap({ data }) {
  const today = new Date();
  const days = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({ date: key, count: data[key] || 0 });
  }
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <HeatCell key={di} count={day.count} date={day.date} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        <span className="text-[10px] text-gray-600">Less</span>
        {[0, 1, 2, 3, 4].map((c) => (
          <HeatCell key={c} count={c} date="" />
        ))}
        <span className="text-[10px] text-gray-600">More</span>
      </div>
    </div>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1a1a] border border-border rounded-lg px-3 py-2 text-xs">
      <div className="text-gray-400 mb-1 font-medium">{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ title, children, className = "" }) {
  return (
    <div className={`glass rounded-xl p-5 ${className}`}>
      {title && (
        <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-4">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/analytics/").then((r) => {
      setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
      </div>
    );

  const {
    overview,
    by_difficulty,
    by_platform,
    weaknesses,
    most_practiced,
    heatmap,
    progression,
    user_stats,
  } = data;

  const diffColors = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };

  const progressionData = progression.map((p) => ({
    month: p.month,
    Easy: p.easy,
    Medium: p.medium,
    Hard: p.hard,
  }));

  const platformData = Object.entries(by_platform).map(([k, v]) => ({
    name: k,
    count: v,
  }));

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-cal text-2xl text-white mb-1">Analytics</h1>
        <p className="text-sm text-gray-500">Your coding journey at a glance</p>
      </div>

      {/* XP / Level / Streak hero row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Current Level",
            value: `Lvl ${user_stats.level}`,
            sub: `${user_stats.xp} total XP`,
            color: "text-green-400",
          },
          {
            label: "XP This Level",
            value: `${user_stats.xp_in_current_level}/100`,
            sub: "until next level",
            color: "text-green-400",
            bar: user_stats.xp_in_current_level,
          },
          {
            label: "Current Streak",
            value: `${user_stats.streak}🔥`,
            sub: "consecutive days",
            color: "text-amber-400",
          },
          {
            label: "Longest Streak",
            value: `${user_stats.longest_streak}🏆`,
            sub: "personal best",
            color: "text-amber-400",
          },
        ].map((s, i) => (
          <Card key={i}>
            <div className={`text-2xl font-bold ${s.color} mb-1`}>
              {s.value}
            </div>
            <div className="text-xs text-gray-500">{s.label}</div>
            <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
            {s.bar !== undefined && (
              <div className="mt-3 bg-white/5 rounded-full h-1">
                <div
                  className="bg-green-500 h-1 rounded-full"
                  style={{ width: `${s.bar}%` }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Overview row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Total Problems",
            value: overview.total,
            color: "text-white",
          },
          { label: "Solved", value: overview.solved, color: "text-green-400" },
          {
            label: "Revision",
            value: overview.revision,
            color: "text-amber-400",
          },
          {
            label: "Solve Rate",
            value: `${overview.solve_rate}%`,
            color: "text-green-400",
          },
        ].map((s, i) => (
          <Card key={i}>
            <div className={`text-2xl font-bold ${s.color} mb-1`}>
              {s.value}
            </div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Time Stats */}
      {data.time?.total_mins > 0 && (
        <Card title="⏱ Time Invested" className="mb-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {data.time.total_mins >= 60
                  ? `${Math.floor(data.time.total_mins / 60)}h ${data.time.total_mins % 60}m`
                  : `${data.time.total_mins}m`}
              </div>
              <div className="text-xs text-gray-500">Total time spent</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">
                {data.time.avg_mins}m
              </div>
              <div className="text-xs text-gray-500">Avg per problem</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                Slowest problems
              </div>
              {data.time.slowest.map((p) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center mb-2"
                >
                  <span className="text-xs text-gray-400 truncate mr-2">
                    {p.title}
                  </span>
                  <span className="text-xs font-mono text-amber-400 shrink-0">
                    {p.time_spent_mins >= 60
                      ? `${Math.floor(p.time_spent_mins / 60)}h ${p.time_spent_mins % 60}m`
                      : `${p.time_spent_mins}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Heatmap */}
      <Card title="Activity — Last 365 Days" className="mb-4">
        <Heatmap data={heatmap} />
      </Card>

      {/* Difficulty breakdown + Progression */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card title="By Difficulty">
          {["easy", "medium", "hard"].map((d) => {
            const info = by_difficulty[d];
            const pct =
              info.total > 0 ? Math.round((info.solved / info.total) * 100) : 0;
            const color = diffColors[d];
            const textC =
              d === "easy"
                ? "text-green-400"
                : d === "medium"
                  ? "text-amber-400"
                  : "text-red-400";
            return (
              <div key={d} className="mb-4 last:mb-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-xs font-medium capitalize ${textC}`}>
                    {d}
                  </span>
                  <span className="text-xs text-gray-500">
                    {info.solved}/{info.total}
                    <span className="text-gray-700 ml-1">({pct}%)</span>
                  </span>
                </div>
                <div className="bg-white/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            );
          })}
        </Card>

        <Card title="Problems Added — Last 6 Months">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={progressionData} barSize={8} barGap={2}>
              <XAxis
                dataKey="month"
                tick={{ fill: "#555", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#555", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="Easy"
                fill={diffColors.easy}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Medium"
                fill={diffColors.medium}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                dataKey="Hard"
                fill={diffColors.hard}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Weakness detector + Most practiced */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Card title="⚠️ Weakness Detector — Lowest Solve Rate">
          {weaknesses.length === 0 ? (
            <p className="text-sm text-gray-600 italic">
              Add more problems to see weaknesses.
            </p>
          ) : (
            weaknesses.map((t, i) => (
              <div key={t.topic} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-300 font-medium">
                    {t.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600">
                      {t.solved}/{t.total}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        t.solve_rate < 30
                          ? "text-red-400"
                          : t.solve_rate < 60
                            ? "text-amber-400"
                            : "text-green-400"
                      }`}
                    >
                      {t.solve_rate}%
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-full h-1">
                  <div
                    className="h-1 rounded-full transition-all duration-700"
                    style={{
                      width: `${t.solve_rate}%`,
                      background:
                        t.solve_rate < 30
                          ? "#ef4444"
                          : t.solve_rate < 60
                            ? "#f59e0b"
                            : "#22c55e",
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>

        <Card title="🏋️ Most Practiced Topics">
          {most_practiced.length === 0 ? (
            <p className="text-sm text-gray-600 italic">No data yet.</p>
          ) : (
            most_practiced.map((t, i) => (
              <div key={t.topic} className="mb-3 last:mb-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-300 font-medium">
                    {t.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-green-500">
                      {t.solved} solved
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {t.total} total
                    </span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-green-500/60 transition-all duration-700"
                    style={{
                      width: `${Math.min((t.total / (most_practiced[0]?.total || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* Platform breakdown */}
      {platformData.length > 0 && (
        <Card title="By Platform">
          <div className="grid grid-cols-6 gap-3">
            {platformData.map((p) => (
              <div
                key={p.name}
                className="bg-black/20 border border-border rounded-lg p-3 text-center"
              >
                <div className="text-2xl font-black text-green-400 mb-1">
                  {p.count}
                </div>
                <div className="text-[10px] text-gray-500 capitalize">
                  {p.name}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
