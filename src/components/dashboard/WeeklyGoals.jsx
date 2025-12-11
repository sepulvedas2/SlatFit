import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Droplet, Beef, Trophy, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function WeeklyGoals({ weekWorkouts = 0, waterDays = 0, proteinDays = 0 }) {
  const [showCelebration, setShowCelebration] = useState(false);

  // Sistema progressivo de metas
  const getGoalLevel = (current, baseTargets) => {
    if (current >= baseTargets[3]) return 4;
    if (current >= baseTargets[2]) return 3;
    if (current >= baseTargets[1]) return 2;
    if (current >= baseTargets[0]) return 1;
    return 0;
  };

  const workoutTargets = [3, 5, 6, 7];
  const waterTargets = [5, 7, 7, 7];
  const proteinTargets = [4, 5, 6, 7];

  const workoutLevel = getGoalLevel(weekWorkouts, workoutTargets);
  const waterLevel = getGoalLevel(waterDays, waterTargets);
  const proteinLevel = getGoalLevel(proteinDays, proteinTargets);

  const goals = [
    {
      label: "Treinos da semana",
      current: weekWorkouts,
      target: workoutTargets[workoutLevel] || 3,
      icon: Dumbbell,
      color: "text-orange-400",
      level: workoutLevel,
      maxLevel: 4
    },
    {
      label: "Meta de água",
      current: waterDays,
      target: waterTargets[waterLevel] || 5,
      icon: Droplet,
      color: "text-blue-400",
      level: waterLevel,
      maxLevel: 4
    },
    {
      label: "Meta proteica",
      current: proteinDays,
      target: proteinTargets[proteinLevel] || 4,
      icon: Beef,
      color: "text-red-400",
      level: proteinLevel,
      maxLevel: 4
    }
  ];

  const allGoalsCompleted = goals.every(g => g.current >= g.target);
  const allGoalsMaxLevel = goals.every(g => g.level >= g.maxLevel);

  useEffect(() => {
    if (allGoalsCompleted && !allGoalsMaxLevel) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [allGoalsCompleted, allGoalsMaxLevel]);

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6 relative overflow-hidden">
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-[#CEF17B]/20 to-[#084734]/20 flex items-center justify-center z-10"
        >
          <div className="text-center">
            <Trophy className="w-16 h-16 text-[#CEF17B] mx-auto mb-2 animate-bounce" />
            <p className="text-xl font-bold text-white">Metas Batidas! 🎉</p>
            <p className="text-sm text-[#CEEDB2]">Novas metas desbloqueadas!</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Metas da Semana</h3>
        {allGoalsMaxLevel && (
          <Badge className="bg-[#CEF17B]/30 text-[#CEF17B] border-[#CEF17B]/50">
            <Trophy className="w-3 h-3 mr-1" />
            Nível Máximo!
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const isCompleted = goal.current >= goal.target;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${goal.color}`} />
                  <span className="text-sm text-white">{goal.label}</span>
                  {goal.level > 0 && (
                    <Badge className="bg-white/10 text-white border-0 text-xs px-2 py-0">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Nível {goal.level + 1}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${
                    isCompleted ? 'text-[#CEF17B]' : 'text-[#CEEDB2]'
                  }`}>
                    {goal.current}/{goal.target}
                  </span>
                  {isCompleted && goal.level < goal.maxLevel && (
                    <span className="text-xs text-[#CEF17B]">✓</span>
                  )}
                </div>
              </div>
              <Progress 
                value={percentage} 
                className={`h-2 ${isCompleted ? 'bg-[#CEF17B]/20' : 'bg-white/10'}`}
              />
              {isCompleted && goal.level < goal.maxLevel - 1 && (
                <p className="text-xs text-[#CEF17B]/70 text-right">
                  Próxima meta: {goal.level === 0 ? workoutTargets[1] : 
                               goal.label === "Treinos da semana" ? workoutTargets[goal.level + 1] :
                               goal.label === "Meta de água" ? waterTargets[goal.level + 1] :
                               proteinTargets[goal.level + 1]} dias
                </p>
              )}
              {isCompleted && goal.level >= goal.maxLevel - 1 && (
                <p className="text-xs text-[#CEF17B] text-right font-semibold">
                  🏆 Meta Máxima Atingida!
                </p>
              )}
            </div>
          );
        })}
      </div>

      {allGoalsCompleted && !allGoalsMaxLevel && (
        <div className="mt-4 p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/30">
          <p className="text-xs text-[#CEF17B] text-center font-semibold">
            Continue assim para desbloquear metas ainda mais desafiadoras! 🚀
          </p>
        </div>
      )}
    </Card>
  );
}