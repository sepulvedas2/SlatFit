import React from "react";
import { Card } from "@/components/ui/card";
import { Camera, Dumbbell, Target, Calendar, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function QuickActionsGrid() {
  const actions = [
    {
      icon: Camera,
      label: "Scanner",
      color: "purple",
      link: createPageUrl("FoodScanner")
    },
    {
      icon: Dumbbell,
      label: "Treinos",
      color: "orange",
      link: createPageUrl("Workouts")
    },
    {
      icon: Trophy,
      label: "Desafios",
      color: "yellow",
      link: createPageUrl("Challenges")
    },
    {
      icon: Calendar,
      label: "Agenda",
      color: "blue",
      link: createPageUrl("Agenda")
    }
  ];

  const colorClasses = {
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
    yellow: "bg-yellow-500/20 text-yellow-400",
    blue: "bg-blue-500/20 text-blue-400"
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="mb-3">
        <h3 className="font-bold text-white text-sm">Ações Rápidas</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <Link key={index} to={action.link}>
              <Card className="glass-effect border-[#CEF17B]/20 p-0 cursor-pointer hover:scale-105 transition-all">
                <div className="aspect-square flex flex-col items-center justify-center p-3">
                  <div className={`w-10 h-10 rounded-lg ${colorClasses[action.color]} flex items-center justify-center mb-2`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-white/80 text-center font-medium">
                    {action.label}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}