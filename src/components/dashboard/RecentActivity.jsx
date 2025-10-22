import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Apple, Dumbbell, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentActivity({ recentFoods, recentWorkouts }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Recent Foods */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="w-5 h-5 text-green-400" />
          <h3 className="font-bold text-white">Alimentos Recentes</h3>
        </div>
        <div className="space-y-3">
          {recentFoods.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum alimento registrado hoje
            </p>
          ) : (
            recentFoods.map((food) => (
              <div 
                key={food.id} 
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{food.food_name}</p>
                  <p className="text-xs text-gray-400">
                    {Math.round(food.calories)} kcal • {Math.round(food.protein)}g proteína
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-0">
                  {food.meal_type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Workouts */}
      <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-purple-400" />
          <h3 className="font-bold text-white">Treinos Recentes</h3>
        </div>
        <div className="space-y-3">
          {recentWorkouts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum treino registrado esta semana
            </p>
          ) : (
            recentWorkouts.map((workout) => (
              <div 
                key={workout.id} 
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{workout.workout_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-400">
                      {workout.duration_minutes} min • {workout.calories_burned} kcal
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-0">
                  {format(new Date(workout.completed_date), 'dd/MM')}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

    </div>
  );
}