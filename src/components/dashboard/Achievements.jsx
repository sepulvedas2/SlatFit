import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap, Target, Flame } from "lucide-react";

export default function Achievements({ achievements }) {
  const allAchievements = [
    { 
      id: "first_workout", 
      title: "Primeira Vez", 
      description: "Complete seu primeiro treino",
      icon: Zap,
      color: "#FFD43B"
    },
    { 
      id: "streak_7", 
      title: "Sequência de 7", 
      description: "7 dias seguidos de treino",
      icon: Flame,
      color: "#FF6B6B"
    },
    { 
      id: "streak_30", 
      title: "Mês Completo", 
      description: "30 dias consecutivos",
      icon: Star,
      color: "#CEF17B"
    },
    { 
      id: "100_workouts", 
      title: "Centenário", 
      description: "100 treinos completados",
      icon: Trophy,
      color: "#FFD700"
    },
    { 
      id: "protein_king", 
      title: "Rei da Proteína", 
      description: "7 dias batendo meta proteica",
      icon: Target,
      color: "#51CF66"
    },
  ];

  const unlockedIds = achievements.map(a => a.achievement_type);

  return (
    <Card className="glass-effect p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-[#CEF17B]" />
        <h3 className="font-bold text-white">Conquistas</h3>
        <Badge className="ml-auto bg-[#CEF17B]/20 text-[#CEF17B] border-0">
          {achievements.length}/{allAchievements.length}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {allAchievements.map((achievement) => {
          const Icon = achievement.icon;
          const isUnlocked = unlockedIds.includes(achievement.id);
          
          return (
            <div 
              key={achievement.id}
              className={`text-center p-4 rounded-lg transition-all ${
                isUnlocked 
                  ? 'bg-white/20 scale-105' 
                  : 'bg-white/5 opacity-50 grayscale'
              }`}
            >
              <div 
                className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ 
                  backgroundColor: isUnlocked ? `${achievement.color}30` : '#ffffff10'
                }}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ color: isUnlocked ? achievement.color : '#ffffff40' }}
                />
              </div>
              <p className="text-xs font-bold text-white mb-1">{achievement.title}</p>
              <p className="text-xs text-white/60 line-clamp-2">{achievement.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}