import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Lock } from "lucide-react";

export const DIFFICULTY = {
  easy:    { label: "Fácil",   color: "text-green-400",  bg: "bg-green-400/15",  border: "border-green-400/30",  dot: "bg-green-400",  xpRange: "50–80 XP" },
  medium:  { label: "Médio",   color: "text-blue-400",   bg: "bg-blue-400/15",   border: "border-blue-400/30",   dot: "bg-blue-400",   xpRange: "150–250 XP" },
  hard:    { label: "Difícil", color: "text-red-400",    bg: "bg-red-400/15",    border: "border-red-400/30",    dot: "bg-red-400",    xpRange: "400–700 XP" },
  extreme: { label: "Extremo", color: "text-purple-400", bg: "bg-purple-400/15", border: "border-purple-400/30", dot: "bg-purple-400", xpRange: "1000–2000 XP" },
};

export default function ChallengeCard({ challenge, onStart, onComplete, isActive = false, isLocked = false, progress = 0 }) {
  const diff = DIFFICULTY[challenge.difficulty] || DIFFICULTY.easy;
  const pct = challenge.target > 0 ? Math.min(100, Math.round((progress / challenge.target) * 100)) : 0;
  const completed = progress >= challenge.target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 border ${diff.border} ${isLocked ? "opacity-50" : ""} ${isActive ? diff.bg : "bg-white/5"} relative overflow-hidden`}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl z-10">
          <div className="text-center">
            <Lock className="w-6 h-6 text-white/60 mx-auto mb-1" />
            <p className="text-white/60 text-xs">{challenge.lockReason}</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${diff.color}`}>{diff.label}</span>
            <span className="text-[#CEF17B] text-xs font-bold ml-auto">+{challenge.xp} XP</span>
          </div>
          <p className="text-white font-bold text-sm leading-snug">{challenge.title}</p>
          <p className="text-white/50 text-xs mt-0.5">{challenge.description}</p>
        </div>
        <div className="text-3xl shrink-0">{challenge.icon}</div>
      </div>

      {isActive && (
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Progresso</span>
            <span className="text-white font-semibold">{progress}/{challenge.target} {challenge.unit}</span>
          </div>
          <Progress value={pct} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B] [&>div]:transition-all [&>div]:duration-700 rounded-full" />
        </div>
      )}

      {!isLocked && (
        <div className="flex gap-2">
          {!isActive && !completed && (
            <Button
              onClick={() => onStart(challenge)}
              size="sm"
              className="w-full h-8 bg-[#CEF17B] text-black font-bold text-xs hover:bg-[#b8d960] rounded-xl"
            >
              Iniciar Desafio
            </Button>
          )}
          {isActive && completed && (
            <Button
              onClick={() => onComplete(challenge)}
              size="sm"
              className="w-full h-8 bg-gradient-to-r from-[#CEF17B] to-emerald-400 text-black font-bold text-xs hover:opacity-90 rounded-xl animate-pulse"
            >
              🎉 Concluir Desafio
            </Button>
          )}
          {isActive && !completed && (
            <div className="w-full h-8 flex items-center justify-center">
              <span className="text-white/40 text-xs">Em andamento • {pct}% completo</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}