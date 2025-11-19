import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp } from "lucide-react";

export default function PointsCard({ userPoints }) {
  if (!userPoints) return null;

  const xpPercentage = (userPoints.xp_current / userPoints.xp_next_level) * 100;

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#CEF17B]" />
          </div>
          <div>
            <p className="text-sm text-[#CEEDB2]">Pontuação FitLens</p>
            <p className="text-2xl font-bold text-white">{userPoints.total_points} pts</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[#CEF17B] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Nível {userPoints.level}</span>
          </div>
          <p className="text-xs text-white/60">
            {userPoints.xp_current}/{userPoints.xp_next_level} XP
          </p>
        </div>
      </div>
      
      <Progress value={xpPercentage} className="h-2 mb-3" />
      
      <p className="text-xs text-[#CEEDB2] text-center">
        Ganhe pontos treinando, registrando refeições e cumprindo metas
      </p>
    </Card>
  );
}