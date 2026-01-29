import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Flame, Dumbbell, Droplets, ChevronRight } from "lucide-react";

export default function TodayGoals({ todayCalories, calorieTarget, todayWorkouts, nutritionData }) {
  const calorieProgress = calorieTarget > 0 ? (todayCalories / calorieTarget) * 100 : 0;
  const workoutComplete = todayWorkouts?.length > 0;
  const waterIntake = nutritionData?.water_intake_ml || 0;
  const waterGoal = nutritionData?.water_goal_ml || 2000;
  const waterProgress = (waterIntake / waterGoal) * 100;

  const goals = [
    {
      icon: Flame,
      title: "Calorias",
      current: todayCalories,
      target: calorieTarget,
      unit: "kcal",
      progress: calorieProgress,
      link: createPageUrl("FoodScanner"),
      color: "text-orange-400"
    },
    {
      icon: Dumbbell,
      title: "Treino",
      current: workoutComplete ? 1 : 0,
      target: 1,
      unit: "treino",
      progress: workoutComplete ? 100 : 0,
      link: createPageUrl("Workouts"),
      color: "text-[#CEF17B]"
    },
    {
      icon: Droplets,
      title: "Hidratação",
      current: waterIntake,
      target: waterGoal,
      unit: "ml",
      progress: waterProgress,
      link: createPageUrl("SmartNutrition"),
      color: "text-blue-400"
    }
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-5">
      <h3 className="font-bold text-white text-lg mb-4">Metas de Hoje</h3>
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const isComplete = goal.progress >= 100;
          
          return (
            <Link key={index} to={goal.link}>
              <div className="group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${goal.color}`} />
                    <span className="text-sm font-semibold text-white">{goal.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${isComplete ? 'text-green-400' : 'text-white/70'}`}>
                      {goal.current} / {goal.target} {goal.unit}
                    </span>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                  </div>
                </div>
                <Progress 
                  value={Math.min(goal.progress, 100)} 
                  className={`h-2 ${isComplete ? 'bg-green-500/20' : 'bg-white/10'}`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}