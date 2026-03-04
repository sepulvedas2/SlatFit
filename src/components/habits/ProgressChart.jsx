import React, { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, defs, linearGradient, stop } from "recharts";
import { format, subDays, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Flame, Trophy, Target, Star } from "lucide-react";
import { getLevel } from "./HabitStats";

const PERIODS = [
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
  { key: "90d", label: "90 dias" },
];

function buildChartData(period, logsByDate, habits) {
  const today = format(new Date(), "yyyy-MM-dd");
  let days = [];

  if (period === "week") {
    const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
    days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  } else if (period === "month") {
    days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), 29 - i));
  } else {
    days = Array.from({ length: 90 }, (_, i) => subDays(new Date(), 89 - i));
  }

  return days.map(day => {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayLogs = logsByDate[dateStr] || [];
    const done = dayLogs.filter(l => l.completed).length;
    const total = habits.length;
    const consistency = total > 0 && dateStr <= today ? Math.round((done / total) * 100) : null;
    const isToday = dateStr === today;

    let label;
    if (period === "week") label = format(day, "EEE", { locale: ptBR });
    else if (period === "month") label = format(day, "d");
    else label = format(day, "d/M");

    return { dateStr, label, consistency, done, total, isToday };
  });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length || payload[0]?.value == null) return null;
  const d = payload[0].payload;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "#0A2A20", border: "1px solid rgba(255,106,0,0.3)" }}>
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-bold text-orange-400">{d.consistency}%</p>
      <p className="text-white/40">{d.done}/{d.total} hábitos</p>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload?.consistency == null) return null;
  if (payload.isToday) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill="#FF6A00" stroke="#FF8C00" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={9} fill="none" stroke="rgba(255,106,0,0.3)" strokeWidth={1.5} />
      </g>
    );
  }
  if (payload.consistency === 100) {
    return <text x={cx} y={cy - 10} textAnchor="middle" fontSize={10}>🔥</text>;
  }
  return <circle cx={cx} cy={cy} r={3} fill="#FF6A00" fillOpacity={0.6} />;
};

export default function ProgressChart({ logsByDate, habits, streak, bestStreak, weekConsistency, totalXp }) {
  const [period, setPeriod] = useState("week");
  const data = useMemo(() => buildChartData(period, logsByDate, habits), [period, logsByDate, habits]);

  const validData = data.filter(d => d.consistency !== null);
  const avgConsistency = validData.length > 0
    ? Math.round(validData.reduce((s, d) => s + d.consistency, 0) / validData.length)
    : 0;

  const levelInfo = getLevel(totalXp || 0);

  const subtitle = habits.length === 0
    ? "Adicione hábitos para começar a acompanhar"
    : avgConsistency >= 80
    ? `Incrível! Você manteve ${avgConsistency}% de consistência.`
    : avgConsistency >= 50
    ? `Você manteve ${avgConsistency}% de consistência. Continue assim!`
    : avgConsistency > 0
    ? `Consistência de ${avgConsistency}%. Vamos melhorar juntos!`
    : "Registre seus hábitos para ver o progresso aqui.";

  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ background: "rgba(8,71,52,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,106,0,0.2)" }}
    >
      {/* Header */}
      <div className="p-5 pb-3 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-white font-bold text-base">Progresso Geral</h3>
            <p className="text-white/50 text-xs mt-0.5 leading-relaxed max-w-[220px]">{subtitle}</p>
          </div>
          {/* Period selector */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: period === p.key ? "rgba(255,106,0,0.25)" : "transparent",
                  color: period === p.key ? "#FF6A00" : "rgba(255,255,255,0.4)",
                  border: period === p.key ? "1px solid rgba(255,106,0,0.4)" : "1px solid transparent",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big number */}
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold" style={{ color: "#FF6A00" }}>{avgConsistency}%</span>
          <span className="text-white/40 text-sm pb-1">consistência</span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 160, paddingLeft: 0, paddingRight: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF6A00" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#FF6A00" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={period === "90d" ? 14 : period === "month" ? 6 : 0}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={75} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="consistency"
              stroke="#FF6A00"
              strokeWidth={2.5}
              fill="url(#orangeGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: "#FF6A00", stroke: "#FF8C00", strokeWidth: 2 }}
              connectNulls={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-white/5 border-t mt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {[
          { icon: "🔥", label: "Streak", value: `${streak}d` },
          { icon: "🏆", label: "Recorde", value: `${bestStreak}d` },
          { icon: "🎯", label: "Semana", value: `${weekConsistency}%` },
          { icon: "⭐", label: levelInfo.label, value: `Nv.${levelInfo.level}` },
        ].map(({ icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 gap-0.5">
            <span className="text-base">{icon}</span>
            <span className="text-white font-bold text-sm">{value}</span>
            <span className="text-white/35 text-[10px]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}