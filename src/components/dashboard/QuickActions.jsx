import React from "react";
import { Card } from "@/components/ui/card";
import { Camera, Dumbbell, Trophy, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function QuickActions() {
  const actions = [
    {
      icon: Camera,
      label: "Escanear",
      sublabel: "Alimento",
      link: "FoodScanner",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: Dumbbell,
      label: "Novo",
      sublabel: "Treino",
      link: "Workouts",
      gradient: "from-orange-500/20 to-red-500/20"
    },
    {
      icon: Trophy,
      label: "Desafios",
      sublabel: "Ativos",
      link: "Challenges",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: Calendar,
      label: "Agenda",
      sublabel: "Tarefas",
      link: "Agenda",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={createPageUrl(action.link)}>
              <Card className={`glass-effect border-[#CEF17B]/20 p-6 hover:scale-105 transition-all cursor-pointer bg-gradient-to-br ${action.gradient}`}>
                <Icon className="w-10 h-10 text-[#CEF17B] mb-3" />
                <p className="text-base font-bold text-white">{action.label}</p>
                <p className="text-xs text-[#CEEDB2]">{action.sublabel}</p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}