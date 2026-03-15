import React from "react";
import { Flame, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function StreakWeeklyCard({ progress, onEditGoal }) {
  const streak = progress?.streak_dias || 0;
  const bestStreak = progress?.longest_streak || 0;
  const weeklyGoal = progress?.weekly_goal || 4;
  const weeklyDone = progress?.weekly_completed || 0;
  const weeklyPct = Math.min(100, Math.round((weeklyDone / weeklyGoal) * 100));
  const goalReached = weeklyDone >= weeklyGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="glass-effect rounded-2xl p-5 border border-[#CEF17B]/20"
      style={{ backgroundColor: "rgba(22,42,40,0.8)" }}
    >
      {/* Streak */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="text-[#A0B5B2] text-xs">Sequência atual</p>
            <p className="text-white font-black text-2xl leading-tight">
              {streak} <span className="text-base font-semibold text-[#CEEDB2]">{streak === 1 ? "dia" : "dias"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#CEF17B]/10 rounded-xl px-3 py-2">
          <Trophy className="w-4 h-4 text-[#CEF17B]" />
          <div>
            <p className="text-[#A0B5B2] text-xs">Recorde</p>
            <p className="text-[#CEF17B] font-bold text-sm">{bestStreak}d</p>
          </div>
        </div>
      </div>

      {/* Divisor */}
      <div className="border-t border-white/10 mb-4" />

      {/* Meta semanal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#CEF17B]" />
            <p className="text-[#CEEDB2] text-sm font-semibold">Meta semanal</p>
          </div>
          <button onClick={onEditGoal} className="text-[#A0B5B2] text-xs underline underline-offset-2">
            Editar
          </button>
        </div>

        <div className="flex items-center justify-between mb-2">
          <p className="text-white font-bold text-sm">{weeklyDone} / {weeklyGoal} treinos</p>
          <p className={`text-xs font-semibold ${goalReached ? "text-green-400" : "text-[#A0B5B2]"}`}>
            {goalReached ? "✓ Meta atingida!" : `${weeklyGoal - weeklyDone} restante${weeklyGoal - weeklyDone !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Barra de progresso */}
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${weeklyPct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${goalReached ? "bg-green-400" : "bg-gradient-to-r from-[#CEF17B] to-green-400"}`}
          />
        </div>

        {goalReached && (
          <p className="text-green-400 text-xs mt-2 font-medium">
            🏆 Meta semanal concluída! Continue mantendo consistência.
          </p>
        )}
      </div>
    </motion.div>
  );
}