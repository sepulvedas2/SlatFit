import React from "react";
import { Card } from "@/components/ui/card";
import { Trophy, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function QuickAchievements({ achievements, workoutCount, streak }) {
  const quickAchievements = [
    {
      id: "first_workout",
      icon: "🎯",
      title: "Primeira Conquista",
      unlocked: workoutCount >= 1
    },
    {
      id: "streak_7",
      icon: "🔥",
      title: "7 Dias Seguidos",
      unlocked: streak >= 7
    },
    {
      id: "100_workouts",
      icon: "💪",
      title: "100 Treinos",
      unlocked: workoutCount >= 100
    },
    {
      id: "consistency",
      icon: "⭐",
      title: "Consistência Master",
      unlocked: streak >= 30
    }
  ];

  const unlockedCount = quickAchievements.filter(a => a.unlocked).length;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Link to={createPageUrl("Challenges")}>
        <Card className="glass-effect border-[#CEF17B]/20 p-5 cursor-pointer hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#CEF17B]" />
              <h3 className="font-bold text-white text-sm">Conquistas</h3>
            </div>
            <div className="text-xs text-white/60">
              {unlockedCount}/{quickAchievements.length}
            </div>
          </div>

          <div className="flex gap-2">
            {quickAchievements.map((achievement, index) => (
              <div
                key={index}
                className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-3xl ${
                  achievement.unlocked 
                    ? 'bg-[#CEF17B]/20 border border-[#CEF17B]/30' 
                    : 'bg-white/5 opacity-30'
                }`}
              >
                {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/30" />}
              </div>
            ))}
          </div>

          <div className="text-center mt-3">
            <p className="text-xs text-white/60">Toque para ver todas →</p>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}