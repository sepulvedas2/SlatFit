import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, Dumbbell, UtensilsCrossed, Plus } from "lucide-react";

export default function QuickActions() {
  const actions = [
    {
      title: "Escanear Alimento",
      icon: Camera,
      color: "from-blue-500 to-cyan-500",
      path: createPageUrl("FoodScanner")
    },
    {
      title: "Novo Treino",
      icon: Dumbbell,
      color: "from-purple-500 to-pink-500",
      path: createPageUrl("Workouts")
    },
    {
      title: "Ver Refeições",
      icon: UtensilsCrossed,
      color: "from-orange-500 to-red-500",
      path: createPageUrl("MealPlans")
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.title} to={action.path}>
            <Button
              variant="outline"
              className="w-full h-auto flex-col gap-2 p-4 bg-slate-900/50 backdrop-blur-xl border-white/10 hover:bg-slate-800/50 hover:scale-105 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} bg-opacity-20`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium text-white">{action.title}</span>
            </Button>
          </Link>
        );
      })}
    </div>
  );
}