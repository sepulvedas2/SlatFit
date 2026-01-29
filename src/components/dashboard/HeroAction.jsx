import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Flame, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function HeroAction({ 
  hasCheckIn, 
  todayWorkouts, 
  todayCalories, 
  calorieTarget 
}) {
  // Determinar qual é a ação prioritária do dia
  const getMainAction = () => {
    if (!hasCheckIn) {
      return {
        title: "Check-in Diário",
        subtitle: "Como você está hoje?",
        icon: Sparkles,
        color: "purple",
        link: createPageUrl("CheckIn"),
        buttonText: "Fazer Check-in",
        badge: "Prioridade"
      };
    }

    if (todayWorkouts?.length === 0) {
      return {
        title: "Treino do Dia",
        subtitle: "Hora de treinar!",
        icon: Flame,
        color: "orange",
        link: createPageUrl("Workouts"),
        buttonText: "Iniciar Treino",
        badge: "Pendente"
      };
    }

    if (todayCalories < calorieTarget * 0.8) {
      return {
        title: "Nutrição em Dia",
        subtitle: "Registre suas refeições",
        icon: Play,
        color: "green",
        link: createPageUrl("FoodScanner"),
        buttonText: "Escanear Alimento",
        badge: "Ação"
      };
    }

    return {
      title: "Tudo Certo Hoje!",
      subtitle: "Continue assim amanhã",
      icon: CheckCircle,
      color: "green",
      link: createPageUrl("Challenges"),
      buttonText: "Ver Desafios",
      badge: "Completo"
    };
  };

  const action = getMainAction();
  const Icon = action.icon;

  const colorClasses = {
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    orange: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
    green: "from-green-500/20 to-green-600/10 border-green-500/30"
  };

  const iconColors = {
    purple: "text-purple-400",
    orange: "text-orange-400",
    green: "text-green-400"
  };

  const badgeColors = {
    purple: "bg-purple-500/20 text-purple-400",
    orange: "bg-orange-500/20 text-orange-400",
    green: "bg-green-500/20 text-green-400"
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Link to={action.link}>
        <Card className={`bg-gradient-to-br ${colorClasses[action.color]} border p-8 cursor-pointer hover:scale-[1.02] transition-all`}>
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <Badge className={`${badgeColors[action.color]} border-0 mb-3`}>
                {action.badge}
              </Badge>
              <h2 className="text-2xl font-bold text-white mb-2">
                {action.title}
              </h2>
              <p className="text-white/70">
                {action.subtitle}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-full bg-white/10 flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${iconColors[action.color]}`} />
            </div>
          </div>

          <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-0 h-12 text-base font-semibold">
            {action.buttonText}
          </Button>
        </Card>
      </Link>
    </motion.div>
  );
}