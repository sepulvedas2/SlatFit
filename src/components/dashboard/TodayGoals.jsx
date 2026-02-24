import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dumbbell, Droplets, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TodayGoals({ todayCalories, calorieTarget, todayWorkouts, waterProgress }) {
  const workoutDone = todayWorkouts?.length > 0;
  const waterPct = Math.min(Math.round(waterProgress || 0), 100);
  const calPct = Math.min(Math.round((todayCalories / (calorieTarget || 2000)) * 100), 100);

  const items = [
    {
      icon: Dumbbell,
      label: "Treino",
      value: workoutDone ? "Feito ✓" : "Pendente",
      color: workoutDone ? "text-green-400" : "text-[#CEEDB2]",
      dot: workoutDone ? "bg-green-400" : "bg-white/20",
      href: createPageUrl("Workouts"),
    },
    {
      icon: Droplets,
      label: "Hidratação",
      value: `${waterPct}%`,
      color: waterPct >= 100 ? "text-green-400" : waterPct > 50 ? "text-blue-300" : "text-[#CEEDB2]",
      dot: waterPct >= 100 ? "bg-green-400" : "bg-blue-400",
      href: createPageUrl("SmartNutrition"),
    },
    {
      icon: Flame,
      label: "Calorias",
      value: `${Math.round(todayCalories)} kcal`,
      color: calPct >= 80 ? "text-green-400" : "text-[#CEEDB2]",
      dot: calPct >= 80 ? "bg-green-400" : "bg-orange-400",
      href: createPageUrl("FoodScanner"),
    },
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-5">
      <p className="text-[#CEEDB2] text-xs font-semibold uppercase tracking-wider mb-3">Status do Dia</p>
      <div className="space-y-3">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link key={i} to={item.href} className="flex items-center gap-3 group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
              <Icon className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
              <span className="text-[#CEEDB2] text-sm flex-1">{item.label}</span>
              <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}