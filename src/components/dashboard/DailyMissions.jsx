import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Trophy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyMissions({ userEmail }) {
  const [completedMissions, setCompletedMissions] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const missions = [
    { id: 1, title: "Faça seu Check-in Diário", xp: 10, icon: "🎯" },
    { id: 2, title: "Registre 3 Refeições", xp: 30, icon: "🍽️" },
    { id: 3, title: "Atinja Meta de Calorias", xp: 40, icon: "🔥" },
    { id: 4, title: "Complete um Treino", xp: 50, icon: "💪" },
    { id: 5, title: "Beba 2L de Água", xp: 20, icon: "💧" },
  ];

  const handleMissionComplete = (missionId) => {
    if (!completedMissions.includes(missionId)) {
      setCompletedMissions([...completedMissions, missionId]);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
  };

  const totalXP = missions
    .filter(m => completedMissions.includes(m.id))
    .reduce((sum, m) => sum + m.xp, 0);

  const allCompleted = completedMissions.length === missions.length;

  return (
    <Card className="glass-effect p-6 border-white/10 relative overflow-hidden">
      {showCelebration && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 180 }}
          className="absolute top-4 right-4 text-4xl z-50"
        >
          ✨
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Missões Diárias</h3>
            <p className="text-sm text-white/60">
              {completedMissions.length}/{missions.length} concluídas
            </p>
          </div>
        </div>
        <Badge className="bg-purple-500/20 text-purple-300 border-0 text-lg px-4 py-2">
          <Zap className="w-4 h-4 mr-1" />
          {totalXP} XP
        </Badge>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {missions.map((mission, index) => {
            const isCompleted = completedMissions.includes(mission.id);
            
            return (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => !isCompleted && handleMissionComplete(mission.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{mission.icon}</span>
                    <div>
                      <p className={`font-semibold ${
                        isCompleted ? 'text-white/60 line-through' : 'text-white'
                      }`}>
                        {mission.title}
                      </p>
                      <p className="text-xs text-white/50">+{mission.xp} XP</p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Circle className="w-6 h-6 text-white/30" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {allCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 text-center"
        >
          <p className="text-xl font-bold text-white mb-2">🎉 Todas as Missões Completas!</p>
          <p className="text-sm text-white/80">Você ganhou {totalXP} XP hoje!</p>
        </motion.div>
      )}
    </Card>
  );
}