import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dumbbell, Droplet, Beef } from "lucide-react";

export default function WeeklyGoals({ weekWorkouts = 0, waterDays = 0, proteinDays = 0 }) {
  const goals = [
    {
      label: "Treinos da semana",
      current: weekWorkouts,
      target: 5,
      icon: Dumbbell,
      color: "text-orange-400"
    },
    {
      label: "Meta de água",
      current: waterDays,
      target: 7,
      icon: Droplet,
      color: "text-blue-400"
    },
    {
      label: "Meta proteica",
      current: proteinDays,
      target: 7,
      icon: Beef,
      color: "text-red-400"
    }
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <h3 className="text-lg font-bold text-white mb-4">Metas da Semana</h3>
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = (goal.current / goal.target) * 100;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${goal.color}`} />
                  <span className="text-sm text-white">{goal.label}</span>
                </div>
                <span className="text-sm text-[#CEEDB2] font-semibold">
                  {goal.current}/{goal.target}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}