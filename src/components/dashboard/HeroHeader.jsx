import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroHeader({ user, userPoints, level, xpProgress }) {
  const displayName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Atleta';
  
  const levelTitles = {
    1: "Iniciante",
    2: "Dedicado", 
    3: "Comprometido",
    4: "Avançado",
    5: "Expert",
    6: "Elite",
    7: "Master",
    8: "Champion"
  };

  const currentLevel = level || 1;
  const levelTitle = levelTitles[currentLevel] || "Master";
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="glass-effect border-[#CEF17B]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Olá, {displayName}
            </h1>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#CEF17B]" />
              <span className="text-[#CEF17B] font-semibold">
                Nível {currentLevel} · {levelTitle}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {userPoints?.total_points || 0}
            </div>
            <div className="text-xs text-white/60">pontos totais</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Progresso para Nível {currentLevel + 1}</span>
            <span>{userPoints?.xp_current || 0} / {userPoints?.xp_next_level || 100} XP</span>
          </div>
          <Progress 
            value={xpProgress || 0} 
            className="h-2 bg-white/10"
          />
        </div>
      </Card>
    </motion.div>
  );
}