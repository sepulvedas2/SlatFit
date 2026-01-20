import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, Dumbbell, Droplet, CheckCircle } from "lucide-react";

export default function DailyGoals({ 
  todayCalories, 
  calorieTarget, 
  todayWorkouts, 
  nutritionData,
  profile 
}) {
  const calorieProgress = calorieTarget > 0 ? (todayCalories / calorieTarget) * 100 : 0;
  const workoutComplete = todayWorkouts?.length > 0;
  const waterGoalReached = nutritionData?.water_goal_reached || false;
  
  const goals = [
    {
      icon: Utensils,
      label: "Meta Calórica",
      current: Math.round(todayCalories),
      target: calorieTarget,
      unit: "kcal",
      progress: Math.min(calorieProgress, 100),
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      icon: Dumbbell,
      label: "Treino do Dia",
      current: todayWorkouts?.length || 0,
      target: 1,
      unit: workoutComplete ? "concluído" : "pendente",
      progress: workoutComplete ? 100 : 0,
      color: "text-[#CEF17B]",
      bgColor: "bg-[#CEF17B]/20"
    },
    {
      icon: Droplet,
      label: "Hidratação",
      current: nutritionData?.water_intake_ml || 0,
      target: nutritionData?.water_goal_ml || 2000,
      unit: "ml",
      progress: Math.min(((nutritionData?.water_intake_ml || 0) / (nutritionData?.water_goal_ml || 2000)) * 100, 100),
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/20"
    }
  ];

  const completedGoals = goals.filter(g => g.progress >= 100).length;

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-lg mb-1">Metas de Hoje</h3>
          <p className="text-[#CEEDB2] text-sm">
            {completedGoals} de {goals.length} completas
          </p>
        </div>
        {completedGoals === goals.length && (
          <div className="bg-green-500/20 px-3 py-2 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        {goals.map((goal, idx) => {
          const Icon = goal.icon;
          const isComplete = goal.progress >= 100;
          
          return (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${goal.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${goal.color}`} />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{goal.label}</p>
                    <p className="text-[#CEEDB2] text-xs">
                      {goal.current} / {goal.target} {goal.unit}
                    </p>
                  </div>
                </div>
                {isComplete && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
              </div>
              <Progress 
                value={goal.progress} 
                className="h-2 bg-white/10"
              />
            </div>
          );
        })}
      </div>

      {completedGoals === goals.length ? (
        <div className="mt-6 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
          <p className="text-green-300 text-sm text-center font-semibold">
            🎉 Todas as metas cumpridas! Disciplina diária em ação.
          </p>
        </div>
      ) : (
        <div className="mt-6 p-3 bg-[#CEF17B]/10 rounded-lg">
          <p className="text-white text-sm text-center">
            <strong>Foco:</strong> Complete suas metas para maximizar resultados hoje.
          </p>
        </div>
      )}
    </Card>
  );
}