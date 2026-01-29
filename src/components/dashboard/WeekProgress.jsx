import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function WeekProgress({ weekWorkouts, waterDays, proteinDays }) {
  const weekGoals = [
    {
      label: "Treinos",
      current: weekWorkouts,
      target: 3,
      icon: "🏋️"
    },
    {
      label: "Hidratação",
      current: waterDays,
      target: 5,
      icon: "💧"
    },
    {
      label: "Proteína",
      current: proteinDays,
      target: 5,
      icon: "🥩"
    }
  ];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="glass-effect border-[#CEF17B]/20 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm">Semana</h3>
          <Target className="w-4 h-4 text-[#CEF17B]" />
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {weekGoals.map((goal, index) => {
            const isComplete = goal.current >= goal.target;
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg ${isComplete ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/5'}`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{goal.icon}</div>
                  <div className="text-xs text-white/60 mb-1">{goal.label}</div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="font-bold text-white">{goal.current}</span>
                    <span className="text-white/40">/</span>
                    <span className="text-white/60 text-sm">{goal.target}</span>
                    {isComplete && <CheckCircle className="w-3 h-3 text-green-400 ml-1" />}
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