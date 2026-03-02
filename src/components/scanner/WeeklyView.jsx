import React, { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine, Tooltip } from "recharts";
import { format, startOfWeek, addDays } from "date-fns";
import { TrendingUp, Trophy, AlertTriangle, Star } from "lucide-react";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function WeeklyView({ foodsByDate, calorieTarget }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(weekStart, i);
      const dateStr = format(day, "yyyy-MM-dd");
      const foods = foodsByDate[dateStr] || [];
      const calories = foods.reduce((s, f) => s + (f.calories || 0), 0);
      const hasData = foods.length > 0;
      return {
        day: DAY_LABELS[i],
        dateStr,
        calories,
        hasData,
        pct: calorieTarget > 0 ? calories / calorieTarget : 0,
      };
    });
  }, [foodsByDate, calorieTarget]);

  const registeredDays = weekData.filter(d => d.hasData);
  const totalCalories = registeredDays.reduce((s, d) => s + d.calories, 0);
  const avgCalories = registeredDays.length > 0 ? Math.round(totalCalories / registeredDays.length) : 0;
  const bestDay = [...registeredDays].sort((a, b) => {
    const da = Math.abs(a.calories - calorieTarget);
    const db = Math.abs(b.calories - calorieTarget);
    return da - db;
  })[0];
  const worstDay = [...registeredDays].sort((a, b) => {
    const da = Math.abs(a.calories - calorieTarget);
    const db = Math.abs(b.calories - calorieTarget);
    return db - da;
  })[0];

  // Score de consistência
  const consistencyScore = registeredDays.length > 0
    ? Math.round(
        registeredDays.reduce((acc, d) => {
          const diff = Math.abs(d.calories - calorieTarget) / calorieTarget;
          const dayScore = Math.max(0, 100 - diff * 100);
          return acc + dayScore;
        }, 0) / 7
      )
    : 0;

  const scoreColor = consistencyScore >= 80 ? "#4ade80" : consistencyScore >= 50 ? "#facc15" : "#f87171";

  return (
    <div className="space-y-4">
      {/* Gráfico */}
      <div
        className="rounded-3xl p-5 space-y-4"
        style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Visão Semanal</h3>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: `${scoreColor}20`, color: scoreColor, border: `1px solid ${scoreColor}40` }}
          >
            {consistencyScore}% consistente
          </div>
        </div>

        {registeredDays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-sm">Nenhum registro esta semana.</p>
            <p className="text-white/20 text-xs mt-1">Comece a registrar suas refeições!</p>
          </div>
        ) : (
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} barSize={24}>
                <XAxis dataKey="day" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: "#0F2922", border: "1px solid rgba(206,241,123,0.2)", borderRadius: 12, color: "white", fontSize: 12 }}
                  formatter={(v) => [`${v} kcal`]}
                  labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                />
                <ReferenceLine y={calorieTarget} stroke="rgba(206,241,123,0.4)" strokeDasharray="4 4" />
                <Bar dataKey="calories" radius={[8, 8, 4, 4]}>
                  {weekData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={!d.hasData ? "rgba(255,255,255,0.06)" : d.pct > 1.05 ? "#f87171" : d.pct >= 0.9 ? "#4ade80" : "#CEF17B"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#CEF17B]" />
            <span className="text-white/50">Dentro da meta</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-white/50">Meta atingida</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-white/50">Acima da meta</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-2xl p-4 space-y-1"
          style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.15)" }}
        >
          <TrendingUp className="w-5 h-5 text-[#CEF17B] mb-2" />
          <div className="text-white font-bold text-xl">{avgCalories}</div>
          <div className="text-white/50 text-xs">Média diária (kcal)</div>
        </div>
        <div
          className="rounded-2xl p-4 space-y-1"
          style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.15)" }}
        >
          <Star className="w-5 h-5 text-yellow-400 mb-2" />
          <div className="font-bold text-xl" style={{ color: scoreColor }}>{consistencyScore}/100</div>
          <div className="text-white/50 text-xs">Score nutricional</div>
        </div>
      </div>

      {(bestDay || worstDay) && (
        <div className="grid grid-cols-2 gap-3">
          {bestDay && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <Trophy className="w-4 h-4 text-green-400 mb-2" />
              <div className="text-green-300 font-bold text-sm">{bestDay.day}</div>
              <div className="text-white/50 text-xs mt-0.5">Melhor dia 🏆</div>
            </div>
          )}
          {worstDay && worstDay.day !== bestDay?.day && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <AlertTriangle className="w-4 h-4 text-red-400 mb-2" />
              <div className="text-red-300 font-bold text-sm">{worstDay.day}</div>
              <div className="text-white/50 text-xs mt-0.5">Mais difícil</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}