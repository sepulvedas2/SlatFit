import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

const BADGES = [
  { days: 3, label: "3 dias", emoji: "🔥", desc: "Iniciante consistente" },
  { days: 7, label: "7 dias", emoji: "⭐", desc: "Uma semana perfeita" },
  { days: 30, label: "30 dias", emoji: "🏆", desc: "Mestre da consistência" },
];

export default function StreakBadges({ streak }) {
  if (streak < 2) return null;

  return (
    <div
      className="rounded-3xl p-4 space-y-3"
      style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}
    >
      <div className="flex items-center gap-2">
        <Flame className="w-4 h-4 text-orange-400" />
        <h3 className="text-white font-bold text-sm">Conquistas de Sequência</h3>
      </div>

      <div className="flex gap-3">
        {BADGES.map(({ days, label, emoji, desc }) => {
          const unlocked = streak >= days;
          return (
            <motion.div
              key={days}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center"
              style={{
                background: unlocked ? "rgba(206,241,123,0.1)" : "rgba(255,255,255,0.04)",
                border: unlocked ? "1px solid rgba(206,241,123,0.3)" : "1px solid rgba(255,255,255,0.08)",
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs font-bold" style={{ color: unlocked ? "#CEF17B" : "rgba(255,255,255,0.4)" }}>{label}</span>
              <span className="text-[10px] text-white/40 leading-tight">{desc}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}