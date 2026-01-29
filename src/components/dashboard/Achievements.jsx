import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trophy, Lock, ChevronRight } from "lucide-react";

export default function Achievements({ achievements = [], workoutCount, streak }) {
  const unlockedCount = achievements.length;
  const totalAchievements = 10; // Total de conquistas possíveis

  // Próxima conquista disponível
  const nextAchievement = (() => {
    if (workoutCount < 1) return { title: "Primeira Vitória", desc: "Complete seu primeiro treino", progress: "0/1" };
    if (streak < 7) return { title: "Semana Forte", desc: "7 dias consecutivos treinando", progress: `${streak}/7` };
    if (workoutCount < 10) return { title: "Dedicação", desc: "Complete 10 treinos", progress: `${workoutCount}/10` };
    if (workoutCount < 50) return { title: "Consistência", desc: "Complete 50 treinos", progress: `${workoutCount}/50` };
    return { title: "Lenda", desc: "Complete 100 treinos", progress: `${workoutCount}/100` };
  })();

  return (
    <Link to={createPageUrl("Challenges")}>
      <Card className="glass-effect border-[#CEF17B]/20 p-5 cursor-pointer hover:scale-[1.02] transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-lg">Conquistas</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
              {unlockedCount}/{totalAchievements}
            </Badge>
            <ChevronRight className="w-5 h-5 text-white/40" />
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-lg border border-[#CEF17B]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white/40" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">{nextAchievement.title}</p>
              <p className="text-xs text-white/60">{nextAchievement.desc}</p>
            </div>
            <span className="text-xs font-bold text-[#CEF17B]">{nextAchievement.progress}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}