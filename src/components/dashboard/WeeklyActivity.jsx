import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Apple, Clock, Flame } from "lucide-react";
import { format } from "date-fns";

export default function WeeklyActivity({ workouts, foods }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      
      {/* Recent Workouts */}
      <Card className="glass-effect p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Treinos Recentes</h3>
        </div>
        <div className="space-y-3">
          {workouts.length === 0 ? (
            <p className="text-sm text-white/60 text-center py-4">
              Nenhum treino esta semana
            </p>
          ) : (
            workouts.slice(0, 3).map((workout) => (
              <div 
                key={workout.id} 
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{workout.workout_name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {workout.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {workout.calories_burned} kcal
                    </span>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                  {format(new Date(workout.completed_date), 'dd/MM')}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Recent Foods */}
      <Card className="glass-effect p-6">
        <div className="flex items-center gap-2 mb-4">
          <Apple className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Alimentos de Hoje</h3>
        </div>
        <div className="space-y-3">
          {foods.length === 0 ? (
            <p className="text-sm text-white/60 text-center py-4">
              Nenhum alimento registrado
            </p>
          ) : (
            foods.slice(0, 3).map((food) => (
              <div 
                key={food.id} 
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{food.food_name}</p>
                  <p className="text-xs text-white/60">
                    {Math.round(food.calories)} kcal • {Math.round(food.protein)}g proteína
                  </p>
                </div>
                <Badge variant="secondary" className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                  {food.meal_type}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Card>

    </div>
  );
}