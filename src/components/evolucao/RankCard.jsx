import React from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Dumbbell, Zap } from "lucide-react";

export const RANK_TIERS = [
  { key: "bronze",   label: "Bronze",   icon: "🥉", color: "text-orange-400",  bg: "bg-orange-400/15",  border: "border-orange-400/30",  min: 0,     max: 800   },
  { key: "silver",   label: "Prata",    icon: "🥈", color: "text-gray-300",    bg: "bg-gray-300/15",    border: "border-gray-300/30",    min: 801,   max: 2500  },
  { key: "gold",     label: "Ouro",     icon: "🥇", color: "text-yellow-400",  bg: "bg-yellow-400/15",  border: "border-yellow-400/30",  min: 2501,  max: 6000  },
  { key: "platinum", label: "Platina",  icon: "💎", color: "text-cyan-300",    bg: "bg-cyan-300/15",    border: "border-cyan-300/30",    min: 6001,  max: 12000 },
  { key: "diamond",  label: "Diamante", icon: "💠", color: "text-blue-300",    bg: "bg-blue-300/15",    border: "border-blue-300/30",    min: 12001, max: 20000 },
  { key: "legendary",label: "Lendário", icon: "👑", color: "text-purple-300",  bg: "bg-purple-300/15",  border: "border-purple-300/30",  min: 20001, max: Infinity },
];

export function getRankByXP(xp) {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].min) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
}

export function getNextRank(currentRank) {
  const idx = RANK_TIERS.findIndex(r => r.key === currentRank.key);
  return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
}

export default function RankCard({ totalXP = 0, streak = 0, totalWorkouts = 0, totalCalories = 0, isActiveToday = false }) {
  const rank = getRankByXP(totalXP);
  const nextRank = getNextRank(rank);
  const progressInRank = totalXP - rank.min;
  const rangeSize = nextRank ? (nextRank.min - rank.min) : 1;
  const pct = nextRank ? Math.min(100, Math.round((progressInRank / rangeSize) * 100)) : 100;

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className={`rounded-2xl p-5 border ${rank.border} ${rank.bg} backdrop-blur-sm`}>
        {/* Rank Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl ${isActiveToday ? "ring-2 ring-[#CEF17B]/60 animate-pulse" : ""} bg-black/20`}>
              {rank.icon}
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest font-semibold">Ranking Atual</p>
              <p className={`text-2xl font-black ${rank.color}`}>{rank.label}</p>
              {isActiveToday && (
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-[10px] mt-1">✓ Ativo hoje</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-black ${rank.color}`}>{totalXP.toLocaleString()}</p>
            <p className="text-white/50 text-xs">XP total</p>
          </div>
        </div>

        {/* Progress to next rank */}
        {nextRank ? (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-white/60">{rank.label}</span>
              <span className={`font-semibold ${nextRank.color}`}>{nextRank.icon} {nextRank.label}</span>
            </div>
            <Progress value={pct} className="h-2.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#CEF17B] [&>div]:to-emerald-400 [&>div]:transition-all [&>div]:duration-1000 rounded-full" />
            <p className="text-white/40 text-xs text-right">{(nextRank.min - totalXP).toLocaleString()} XP para {nextRank.label}</p>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-purple-300 font-bold text-sm">👑 Rank máximo atingido!</p>
          </div>
        )}

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
          {[
            { icon: <Flame className="w-4 h-4 text-orange-400" />, value: streak, label: "streak" },
            { icon: <Dumbbell className="w-4 h-4 text-[#CEF17B]" />, value: totalWorkouts, label: "treinos" },
            { icon: <Zap className="w-4 h-4 text-yellow-400" />, value: `${Math.round(totalCalories / 1000)}k`, label: "kcal" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-white/40 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}