import React from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, Dumbbell, Trophy, Calendar, UtensilsCrossed, TrendingUp } from "lucide-react";

export default function QuickActionsGrid() {
  const actions = [
    { icon: Camera, label: "Escanear", page: "FoodScanner", color: "text-blue-400" },
    { icon: Dumbbell, label: "Treinos", page: "Workouts", color: "text-[#CEF17B]" },
    { icon: UtensilsCrossed, label: "Nutrição", page: "SmartNutrition", color: "text-orange-400" },
    { icon: Trophy, label: "Desafios", page: "Challenges", color: "text-yellow-400" },
    { icon: Calendar, label: "Agenda", page: "Agenda", color: "text-purple-400" },
    { icon: TrendingUp, label: "Progresso", page: "WorkoutProgress", color: "text-green-400" }
  ];

  return (
    <div>
      <h3 className="font-bold text-white text-lg mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={createPageUrl(action.page)}>
              <Card className="glass-effect border-[#CEF17B]/20 p-4 text-center cursor-pointer hover:scale-105 transition-all">
                <Icon className={`w-8 h-8 ${action.color} mx-auto mb-2`} />
                <p className="text-xs font-semibold text-white">{action.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}