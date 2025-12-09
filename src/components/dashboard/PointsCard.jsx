import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Crown, Award, Star, Flame, Trophy } from "lucide-react";

const LEVEL_RANKS = [
  { level: 1, name: "Iniciante", xpRequired: 0, xpNext: 100, color: "bg-gray-500/20 text-gray-400", icon: Zap },
  { level: 2, name: "Aprendiz", xpRequired: 100, xpNext: 250, color: "bg-green-500/20 text-green-400", icon: Star },
  { level: 3, name: "Praticante", xpRequired: 250, xpNext: 500, color: "bg-blue-500/20 text-blue-400", icon: Award },
  { level: 4, name: "Dedicado", xpRequired: 500, xpNext: 1000, color: "bg-purple-500/20 text-purple-400", icon: Flame },
  { level: 5, name: "Expert", xpRequired: 1000, xpNext: 2000, color: "bg-yellow-500/20 text-yellow-400", icon: Trophy },
  { level: 6, name: "Mestre", xpRequired: 2000, xpNext: 3500, color: "bg-orange-500/20 text-orange-400", icon: Crown },
  { level: 7, name: "Elite", xpRequired: 3500, xpNext: 5500, color: "bg-red-500/20 text-red-400", icon: Crown },
  { level: 8, name: "Lenda", xpRequired: 5500, xpNext: 8000, color: "bg-pink-500/20 text-pink-400", icon: Crown },
  { level: 9, name: "Titã", xpRequired: 8000, xpNext: 11000, color: "bg-indigo-500/20 text-indigo-400", icon: Crown },
  { level: 10, name: "Imortal", xpRequired: 11000, xpNext: 15000, color: "bg-[#CEF17B]/30 text-[#CEF17B]", icon: Crown }
];

export default function PointsCard({ userPoints }) {
  if (!userPoints) return null;

  const totalXP = userPoints.total_points || 0;
  
  // Calculate current level based on total XP
  let currentRank = LEVEL_RANKS[0];
  for (let i = LEVEL_RANKS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_RANKS[i].xpRequired) {
      currentRank = LEVEL_RANKS[i];
      break;
    }
  }

  const xpInCurrentLevel = totalXP - currentRank.xpRequired;
  const xpNeededForNext = currentRank.xpNext - currentRank.xpRequired;
  const xpPercentage = (xpInCurrentLevel / xpNeededForNext) * 100;
  
  const RankIcon = currentRank.icon;

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-14 h-14 rounded-full ${currentRank.color} flex items-center justify-center border-2 border-current`}>
            <RankIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm text-[#CEEDB2]">Pontuação FitLens</p>
            <p className="text-2xl font-bold text-white">{totalXP} pts</p>
          </div>
        </div>
        <div className="text-right">
          <Badge className={`${currentRank.color} border-0 mb-2`}>
            <TrendingUp className="w-3 h-3 mr-1" />
            Nível {currentRank.level}
          </Badge>
          <p className="text-sm font-bold text-white">{currentRank.name}</p>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-xs text-white/60 mb-1">
          <span>Progresso</span>
          <span>{xpInCurrentLevel}/{xpNeededForNext} XP</span>
        </div>
        <Progress value={xpPercentage} className="h-2" />
      </div>
      
      <p className="text-xs text-[#CEEDB2] text-center">
        Ganhe pontos treinando, registrando refeições e cumprindo metas
      </p>
    </Card>
  );
}