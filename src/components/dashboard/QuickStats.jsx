import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Apple, Target, TrendingUp } from "lucide-react";

export default function QuickStats({ 
  todayCalories = 0, 
  calorieTarget = 2000, 
  todayProtein = 0, 
  proteinTarget = 150,
  weekWorkouts = 0,
  currentWeight = 0,
  targetWeight = 0
}) {
  const stats = [
    {
      icon: Flame,
      label: "Calorias",
      value: Math.round(todayCalories),
      target: calorieTarget,
      unit: "kcal",
      color: "#FF6B6B"
    },
    {
      icon: Apple,
      label: "Proteína",
      value: Math.round(todayProtein),
      target: proteinTarget,
      unit: "g",
      color: "#51CF66"
    },
    {
      icon: Target,
      label: "Treinos",
      value: weekWorkouts,
      target: 5,
      unit: "/semana",
      color: "#CEF17B"
    },
    {
      icon: TrendingUp,
      label: "Peso",
      value: currentWeight || 0,
      target: targetWeight || 0,
      unit: "kg",
      color: "#4DABF7"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const progress = stat.target ? (stat.value / stat.target) * 100 : 0;
        
        return (
          <Card key={index} className="glass-effect p-4 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {stat.value}
                  <span className="text-xs text-white/60 ml-1">{stat.unit}</span>
                </div>
                {stat.target > 0 && (
                  <div className="text-xs text-white/60">
                    / {stat.target}{stat.unit}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs font-medium text-white/80 mb-2">{stat.label}</p>
            {stat.target > 0 && (
              <Progress 
                value={Math.min(progress, 100)} 
                className="h-1.5 bg-white/20"
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}