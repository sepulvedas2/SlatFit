import React from "react";
import { TrendingUp, TrendingDown, Star, Droplets } from "lucide-react";

export default function WeeklyReport({ habits, logs }) {
  if (!habits.length || !logs.length) return null;

  // Calcular taxa por hábito
  const habitStats = habits.map(habit => {
    const habitLogs = logs.filter(l => l.habit_id === habit.id && l.completed);
    return { ...habit, completions: habitLogs.length };
  }).filter(h => h.completions > 0);

  if (habitStats.length < 2) return null;

  const sorted = [...habitStats].sort((a, b) => b.completions - a.completions);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  const totalPossible = habits.length * 7;
  const totalDone = logs.filter(l => l.completed).length;
  const consistency = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;

  return (
    <div
      className="rounded-3xl p-5 space-y-4"
      style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.15)" }}
    >
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        <h3 className="text-white font-bold text-base">Relatório da Semana</h3>
      </div>

      <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(206,241,123,0.06)", border: "1px solid rgba(206,241,123,0.15)" }}>
        <span className="text-white/70 text-sm">Consistência geral</span>
        <span className="font-bold text-xl" style={{ color: consistency >= 70 ? "#4ade80" : consistency >= 40 ? "#facc15" : "#f87171" }}>
          {consistency}%
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-2xl" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <TrendingUp className="w-4 h-4 text-green-400 mb-2" />
          <div className="text-green-300 font-bold text-sm">{best.emoji} {best.name}</div>
          <div className="text-white/40 text-xs mt-0.5">{best.completions}x esta semana • Mais forte 💪</div>
        </div>

        <div className="p-3 rounded-2xl" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <TrendingDown className="w-4 h-4 text-red-400 mb-2" />
          <div className="text-red-300 font-bold text-sm">{worst.emoji} {worst.name}</div>
          <div className="text-white/40 text-xs mt-0.5">{worst.completions}x esta semana • Negligenciado</div>
        </div>
      </div>

      {/* Sugestão inteligente */}
      {worst.completions <= 2 && (
        <div className="p-3 rounded-2xl" style={{ background: "rgba(250,204,21,0.06)", border: "1px solid rgba(250,204,21,0.2)" }}>
          <p className="text-yellow-300 text-sm">
            💡 Você mantém {Math.round((best.completions / 7) * 100)}% em <strong>{best.name}</strong>, mas só {Math.round((worst.completions / 7) * 100)}% em <strong>{worst.name}</strong>. Ajustar o horário pode ajudar!
          </p>
        </div>
      )}
    </div>
  );
}