import React from "react";
import { Card } from "@/components/ui/card";
import { CheckCircle, Circle } from "lucide-react";

export default function WeekProgress({ weekWorkouts, waterDays, proteinDays }) {
  const goals = [
    { label: "Treinos", current: weekWorkouts, target: 3, icon: "💪" },
    { label: "Hidratação", current: waterDays, target: 5, icon: "💧" },
    { label: "Proteína", current: proteinDays, target: 5, icon: "🥩" }
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-5">
      <h3 className="font-bold text-white text-lg mb-4">Progresso Semanal</h3>
      <div className="space-y-3">
        {goals.map((goal, index) => {
          const percentage = (goal.current / goal.target) * 100;
          const isComplete = goal.current >= goal.target;
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{goal.icon}</span>
                <span className="text-sm text-white/80">{goal.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isComplete ? 'text-green-400' : 'text-white/70'}`}>
                  {goal.current}/{goal.target}
                </span>
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}