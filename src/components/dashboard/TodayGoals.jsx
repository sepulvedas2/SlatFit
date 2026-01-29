import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Dumbbell, Droplet } from "lucide-react";
import { motion } from "framer-motion";

export default function TodayGoals({ 
  todayCalories, 
  calorieTarget, 
  todayWorkouts,
  waterProgress
}) {
  const goals = [
    {
      icon: Flame,
      label: "Calorias",
      current: Math.round(todayCalories),
      target: calorieTarget,
      unit: "kcal",
      color: "orange"
    },
    {
      icon: Dumbbell,
      label: "Treino",
      current: todayWorkouts?.length || 0,
      target: 1,
      unit: todayWorkouts?.length === 1 ? "concluído" : "pendente",
      color: "blue",
      isBoolean: true
    },
    {
      icon: Droplet,
      label: "Hidratação",
      current: waterProgress || 0,
      target: 100,
      unit: "%",
      color: "cyan"
    }
  ];

  const iconColors = {
    orange: "text-orange-400 bg-orange-500/20",
    blue: "text-blue-400 bg-blue-500/20",
    cyan: "text-cyan-400 bg-cyan-500/20"
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="glass-effect border-[#CEF17B]/20 p-5">
        <h3 className="font-bold text-white mb-4 text-sm">Metas de Hoje</h3>
        
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const Icon = goal.icon;
            const progress = goal.isBoolean 
              ? (goal.current >= goal.target ? 100 : 0)
              : Math.min((goal.current / goal.target) * 100, 100);

            return (
              <div key={index}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${iconColors[goal.color]} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium">{goal.label}</span>
                      <span className="text-xs text-white/60">
                        {goal.isBoolean ? goal.unit : `${goal.current} / ${goal.target} ${goal.unit}`}
                      </span>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/10" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </motion.div>
  );
}