import React, { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Target, Award, Crown, Star, TrendingUp, Droplet, Utensils } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ACHIEVEMENTS = [
  // Nível Iniciante
  {
    id: "first_workout",
    icon: Zap,
    title: "Primeira Vez",
    description: "Complete seu primeiro treino",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    requirement: { type: "workouts", count: 1 }
  },
  {
    id: "streak_7",
    icon: Flame,
    title: "Sequência de 7",
    description: "7 dias seguidos de treino",
    color: "text-orange-400",
    bgColor: "bg-orange-400/20",
    requirement: { type: "streak", count: 7 }
  },
  {
    id: "water_master",
    icon: Droplet,
    title: "Hidratação Perfeita",
    description: "7 dias batendo meta de água",
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    requirement: { type: "water_days", count: 7 }
  },
  {
    id: "protein_king",
    icon: Utensils,
    title: "Rei da Proteína",
    description: "7 dias batendo meta proteica",
    color: "text-red-400",
    bgColor: "bg-red-400/20",
    requirement: { type: "protein_days", count: 7 }
  },
  {
    id: "food_logger",
    icon: Utensils,
    title: "Nutricionista",
    description: "Registre 50 refeições",
    color: "text-green-400",
    bgColor: "bg-green-400/20",
    requirement: { type: "food_logs", count: 50 }
  },

  // Nível Intermediário
  {
    id: "workout_25",
    icon: Target,
    title: "Dedicado",
    description: "25 treinos completados",
    color: "text-blue-500",
    bgColor: "bg-blue-500/20",
    requirement: { type: "workouts", count: 25 }
  },
  {
    id: "streak_14",
    icon: Flame,
    title: "Duas Semanas",
    description: "14 dias consecutivos treinando",
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    requirement: { type: "streak", count: 14 }
  },
  {
    id: "calorie_burner",
    icon: Flame,
    title: "Queimador",
    description: "Queime 5000 calorias totais",
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    requirement: { type: "calories", count: 5000 }
  },
  {
    id: "challenge_3",
    icon: Award,
    title: "Desafiador",
    description: "Complete 3 desafios",
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    requirement: { type: "challenges", count: 3 }
  },
  {
    id: "level_3",
    icon: TrendingUp,
    title: "Praticante",
    description: "Alcance o nível 3",
    color: "text-blue-400",
    bgColor: "bg-blue-400/20",
    requirement: { type: "level", count: 3 }
  },

  // Nível Avançado
  {
    id: "workout_50",
    icon: Trophy,
    title: "Meio Centenário",
    description: "50 treinos completados",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    requirement: { type: "workouts", count: 50 }
  },
  {
    id: "perfect_month",
    icon: Star,
    title: "Mês Completo",
    description: "30 dias consecutivos treinando",
    color: "text-purple-400",
    bgColor: "bg-purple-400/20",
    requirement: { type: "streak", count: 30 }
  },
  {
    id: "calorie_burner_10k",
    icon: Flame,
    title: "Incinerador",
    description: "Queime 10.000 calorias totais",
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    requirement: { type: "calories", count: 10000 }
  },
  {
    id: "food_logger_100",
    icon: Utensils,
    title: "Chef da Nutrição",
    description: "Registre 100 refeições",
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    requirement: { type: "food_logs", count: 100 }
  },
  {
    id: "level_5",
    icon: Crown,
    title: "Expert",
    description: "Alcance o nível 5",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/20",
    requirement: { type: "level", count: 5 }
  },

  // Nível Elite
  {
    id: "workout_milestone_100",
    icon: Trophy,
    title: "Centenário",
    description: "100 treinos completados",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    requirement: { type: "workouts", count: 100 }
  },
  {
    id: "streak_60",
    icon: Flame,
    title: "Dois Meses",
    description: "60 dias consecutivos treinando",
    color: "text-orange-600",
    bgColor: "bg-orange-600/20",
    requirement: { type: "streak", count: 60 }
  },
  {
    id: "challenge_master",
    icon: Award,
    title: "Mestre dos Desafios",
    description: "Complete 10 desafios",
    color: "text-purple-500",
    bgColor: "bg-purple-500/20",
    requirement: { type: "challenges", count: 10 }
  },
  {
    id: "calorie_burner_25k",
    icon: Flame,
    title: "Fornalha",
    description: "Queime 25.000 calorias totais",
    color: "text-red-600",
    bgColor: "bg-red-600/20",
    requirement: { type: "calories", count: 25000 }
  },
  {
    id: "level_8",
    icon: Crown,
    title: "Lenda",
    description: "Alcance o nível 8",
    color: "text-pink-400",
    bgColor: "bg-pink-400/20",
    requirement: { type: "level", count: 8 }
  },

  // Nível Lendário
  {
    id: "workout_200",
    icon: Trophy,
    title: "Bicentenário",
    description: "200 treinos completados",
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/20",
    requirement: { type: "workouts", count: 200 }
  },
  {
    id: "streak_100",
    icon: Flame,
    title: "Centenário da Constância",
    description: "100 dias consecutivos treinando",
    color: "text-red-700",
    bgColor: "bg-red-700/20",
    requirement: { type: "streak", count: 100 }
  },
  {
    id: "calorie_burner_50k",
    icon: Flame,
    title: "Vulcão",
    description: "Queime 50.000 calorias totais",
    color: "text-orange-700",
    bgColor: "bg-orange-700/20",
    requirement: { type: "calories", count: 50000 }
  },
  {
    id: "food_logger_250",
    icon: Utensils,
    title: "Mestre Nutricional",
    description: "Registre 250 refeições",
    color: "text-green-600",
    bgColor: "bg-green-600/20",
    requirement: { type: "food_logs", count: 250 }
  },
  {
    id: "level_10",
    icon: Crown,
    title: "Imortal",
    description: "Alcance o nível 10",
    color: "text-[#CEF17B]",
    bgColor: "bg-[#CEF17B]/20",
    requirement: { type: "level", count: 10 }
  }
];

export default function AchievementSystem({ 
  userEmail, 
  achievements = [],
  workoutCount = 0,
  streak = 0,
  totalCalories = 0,
  foodLogCount = 0,
  userLevel = 1,
  completedChallenges = 0,
  proteinDaysCount = 0,
  waterDaysCount = 0
}) {
  const queryClient = useQueryClient();

  const unlockAchievementMutation = useMutation({
    mutationFn: async (achievement) => {
      return base44.entities.Achievement.create({
        user_email: userEmail,
        achievement_type: achievement.id,
        unlocked_date: new Date().toISOString().split('T')[0],
        title: achievement.title,
        description: achievement.description
      });
    },
    onSuccess: (_, achievement) => {
      queryClient.invalidateQueries(['achievements']);
      toast.success(`🏆 Conquista desbloqueada: ${achievement.title}!`);
    },
  });

  const awardPointsMutation = useMutation({
    mutationFn: async (points) => {
      const userPoints = await base44.entities.UserPoints.filter({ user_email: userEmail });
      if (userPoints[0]) {
        return base44.entities.UserPoints.update(userPoints[0].id, {
          total_points: userPoints[0].total_points + points,
          xp_current: userPoints[0].xp_current + points
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPoints']);
    }
  });

  useEffect(() => {
    if (!userEmail) return;

    const stats = {
      workouts: workoutCount,
      streak: streak,
      calories: totalCalories,
      food_logs: foodLogCount,
      level: userLevel,
      challenges: completedChallenges,
      protein_days: proteinDaysCount,
      water_days: waterDaysCount
    };

    const unlockedIds = achievements.map(a => a.achievement_type);

    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedIds.includes(achievement.id)) return;

      const { type, count } = achievement.requirement;
      const currentValue = stats[type] || 0;

      if (currentValue >= count) {
        unlockAchievementMutation.mutate(achievement);
        awardPointsMutation.mutate(50);
      }
    });
  }, [userEmail, workoutCount, streak, totalCalories, foodLogCount, userLevel, completedChallenges, proteinDaysCount, waterDaysCount]);

  const unlockedIds = achievements.map(a => a.achievement_type);

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#CEF17B]" />
          Conquistas
        </h3>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          {unlockedIds.length}/{ACHIEVEMENTS.length}
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-3">
        <AnimatePresence>
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            const isUnlocked = unlockedIds.includes(achievement.id);

            return (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group"
              >
                <div className={`
                  p-3 rounded-lg border transition-all
                  ${isUnlocked 
                    ? `${achievement.bgColor} border-current ${achievement.color}` 
                    : 'bg-white/5 border-white/10 grayscale opacity-40'
                  }
                `}>
                  <Icon className={`w-6 h-6 mx-auto ${isUnlocked ? achievement.color : 'text-white/20'}`} />
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-10">
                  <p className="text-xs font-bold text-white mb-1">{achievement.title}</p>
                  <p className="text-xs text-gray-300">{achievement.description}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}