import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, TrendingUp } from "lucide-react";

export default function WorkoutCard({ workout, onClick }) {
  const categoryColors = {
    chest: "from-red-500 to-orange-500",
    back: "from-blue-500 to-cyan-500",
    legs: "from-green-500 to-emerald-500",
    shoulders: "from-purple-500 to-pink-500",
    arms: "from-yellow-500 to-orange-500",
    abs: "from-indigo-500 to-purple-500",
    cardio: "from-red-500 to-pink-500",
    full_body: "from-violet-500 to-purple-500",
  };

  const difficultyColors = {
    beginner: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    advanced: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <Card 
      onClick={onClick}
      className="bg-slate-900/50 backdrop-blur-xl border-white/10 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
    >
      <div className={`h-32 bg-gradient-to-br ${categoryColors[workout.category]} p-6 flex items-end`}>
        <h3 className="text-2xl font-bold text-white">{workout.name}</h3>
      </div>
      
      <div className="p-4 space-y-3">
        <p className="text-sm text-gray-300 line-clamp-2">
          {workout.description}
        </p>

        <div className="flex items-center gap-2">
          <Badge className={difficultyColors[workout.difficulty]}>
            {workout.difficulty === 'beginner' ? 'Iniciante' : 
             workout.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
          </Badge>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {workout.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{workout.duration_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>{workout.calories_burned} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{workout.exercises?.length || 0} exercícios</span>
          </div>
        </div>
      </div>
    </Card>
  );
}