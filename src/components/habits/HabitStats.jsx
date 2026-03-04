import React from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, TrendingUp } from "lucide-react";

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 500, label: "Iniciante" },
  { level: 2, minXp: 500, maxXp: 1500, label: "Consistente" },
  { level: 3, minXp: 1500, maxXp: 3000, label: "Disciplinado" },
  { level: 4, minXp: 3000, maxXp: 5000, label: "Dedicado" },
  { level: 5, minXp: 5000, maxXp: 8000, label: "Elite" },
  { level: 6, minXp: 8000, maxXp: 99999, label: "Lendário" },
];

export function getLevel(xp) {
  return LEVELS.find(l => xp >= l.minXp && xp < l.maxXp) || LEVELS[LEVELS.length - 1];
}

export default function HabitStats({ totalXp, streak, bestStreak, weekConsistency }) {
  const levelInfo = getLevel(totalXp || 0);
  const xpInLevel = (totalXp || 0) - levelInfo.minXp;
  const xpForLevel = levelInfo.maxXp - levelInfo.minXp;
  const levelPct = Math.min((xpInLevel / xpForLevel) * 100, 100);

  return (
    <div className="space-y-3">
      {/* XP + Nível */}
      <div
        className="rounded-3xl p-5 space-y-4"
        style={{ background: "rgba(8,71,52,0.7)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">Nível {levelInfo.level}</p>
                <h3 className="text-white font-bold text-lg leading-tight">{levelInfo.label}</h3>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#CEF17B] font-bold text-2xl">{(totalXp || 0).toLocaleString()}</div>
            <div className="text-white/40 text-xs">XP total</div>
          </div>
        </div>

        {/* Barra XP */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-white/40">
            <span>{xpInLevel} XP</span>
            <span>{xpForLevel} XP para nível {levelInfo.level + 1}</span>
          </div>
          <div className="h-3 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #CEF17B, #4ade80)" }}
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Flame, label: "Streak Atual", value: `${streak || 0}d`, color: "#f97316" },
          { icon: Trophy, label: "Melhor Streak", value: `${bestStreak || 0}d`, color: "#facc15" },
          { icon: TrendingUp, label: "Consistência", value: `${weekConsistency || 0}%`, color: "#4ade80" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center"
            style={{ background: "rgba(8,71,52,0.6)", border: "1px solid rgba(206,241,123,0.1)" }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
            <div className="font-bold text-lg text-white">{value}</div>
            <div className="text-[10px] text-white/40 leading-tight">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}