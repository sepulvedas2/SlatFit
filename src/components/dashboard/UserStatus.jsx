import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, Award, Flame, Trophy, Crown } from "lucide-react";

const LEVEL_RANKS = [
  { level: 1, name: "Iniciante", xpRequired: 0, xpNext: 100, icon: Zap },
  { level: 2, name: "Aprendiz", xpRequired: 100, xpNext: 250, icon: Star },
  { level: 3, name: "Praticante", xpRequired: 250, xpNext: 500, icon: Award },
  { level: 4, name: "Dedicado", xpRequired: 500, xpNext: 1000, icon: Flame },
  { level: 5, name: "Expert", xpRequired: 1000, xpNext: 2000, icon: Trophy },
  { level: 6, name: "Mestre", xpRequired: 2000, xpNext: 3500, icon: Crown },
  { level: 7, name: "Elite", xpRequired: 3500, xpNext: 5500, icon: Crown },
  { level: 8, name: "Lenda", xpRequired: 5500, xpNext: 8000, icon: Crown },
  { level: 9, name: "Titã", xpRequired: 8000, xpNext: 11000, icon: Crown },
  { level: 10, name: "Imortal", xpRequired: 11000, xpNext: 15000, icon: Crown }
];

export default function UserStatus({ user, userPoints }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const userName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';
  const totalXP = userPoints?.total_points || 0;
  
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
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center border-2 border-[#CEF17B]/30">
          <RankIcon className="w-8 h-8 text-[#CEF17B]" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">
            {getGreeting()}, {userName}
          </h2>
          <div className="flex items-center gap-2">
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
              Nível {currentRank.level} • {currentRank.name}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/70">Experiência</span>
          <span className="text-sm font-bold text-[#CEF17B]">{totalXP} XP</span>
        </div>
        <Progress value={xpPercentage} className="h-2 bg-white/10" />
        <p className="text-xs text-white/50 text-center">
          {xpInCurrentLevel}/{xpNeededForNext} XP para próximo nível
        </p>
      </div>
    </Card>
  );
}