import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Dumbbell, Apple, X, Clock, Flame } from "lucide-react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WeeklyActivity({ workouts, foods }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }); // Domingo = 0
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getActivityForDay = (date) => {
    const dayWorkouts = workouts.filter(w => 
      isSameDay(new Date(w.completed_date), date)
    );
    const dayFoods = foods.filter(f => 
      isSameDay(new Date(f.log_date), date)
    );
    
    return { 
      workouts: dayWorkouts, 
      foods: dayFoods,
      hasWorkout: dayWorkouts.length > 0,
      hasFoodLog: dayFoods.length > 0
    };
  };

  const handleDayClick = (day) => {
    const activity = getActivityForDay(day);
    if (activity.hasWorkout || activity.hasFoodLog) {
      setSelectedDay({ date: day, ...activity });
      setShowModal(true);
    }
  };

  const getDayLabel = (day) => {
    return format(day, 'EEEE', { locale: ptBR }).substring(0, 3).toUpperCase();
  };

  return (
    <>
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Atividade da Semana</h3>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const { hasWorkout, hasFoodLog } = getActivityForDay(day);
            const isToday = isSameDay(day, new Date());
            const hasActivity = hasWorkout || hasFoodLog;
            
            return (
              <button
                key={index}
                onClick={() => handleDayClick(day)}
                disabled={!hasActivity}
                className={`text-center p-3 rounded-lg transition-all ${
                  isToday 
                    ? 'bg-[#CEF17B]/20 border border-[#CEF17B]/30' 
                    : hasActivity 
                      ? 'bg-white/5 hover:bg-white/10 cursor-pointer' 
                      : 'bg-white/5 opacity-50'
                }`}
              >
                <p className="text-xs font-medium text-white/60 mb-1">
                  {getDayLabel(day)}
                </p>
                <p className="text-sm font-bold text-white mb-2">
                  {format(day, 'd')}
                </p>
                <div className="flex flex-col gap-1 items-center">
                  {hasWorkout && (
                    <div className="w-6 h-6 rounded-full bg-[#CEF17B]/30 flex items-center justify-center">
                      <Dumbbell className="w-3 h-3 text-[#CEF17B]" />
                    </div>
                  )}
                  {hasFoodLog && (
                    <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center">
                      <Apple className="w-3 h-3 text-green-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-3 h-3 text-[#CEF17B]" />
            <span>Treino</span>
          </div>
          <div className="flex items-center gap-2">
            <Apple className="w-3 h-3 text-green-400" />
            <span>Alimentação</span>
          </div>
        </div>
      </Card>

      {/* Modal de Detalhes do Dia */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center justify-between">
              <span>
                {selectedDay && format(selectedDay.date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Treinos do Dia */}
            {selectedDay?.workouts && selectedDay.workouts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Dumbbell className="w-5 h-5 text-[#CEF17B]" />
                  <h4 className="font-bold text-white">
                    Treinos ({selectedDay.workouts.length})
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedDay.workouts.map((workout, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg border border-[#CEF17B]/20"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-white">
                            {workout.workout_name}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#CEEDB2]">
                            {workout.duration_minutes && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{workout.duration_minutes} min</span>
                              </div>
                            )}
                            {workout.calories_burned && (
                              <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3" />
                                <span>{workout.calories_burned} kcal</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                          Concluído
                        </Badge>
                      </div>
                      {workout.notes && (
                        <p className="text-xs text-white/60 mt-2">
                          {workout.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alimentos do Dia */}
            {selectedDay?.foods && selectedDay.foods.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Apple className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-white">
                    Alimentação ({selectedDay.foods.length} registros)
                  </h4>
                </div>
                <div className="space-y-2">
                  {selectedDay.foods.map((food, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg border border-green-500/20"
                    >
                      <p className="font-semibold text-white">
                        {food.food_name}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#CEEDB2]">
                        <span>{food.calories} kcal</span>
                        <span>•</span>
                        <span>P: {food.protein}g</span>
                        <span>•</span>
                        <span>C: {food.carbs}g</span>
                        <span>•</span>
                        <span>G: {food.fats}g</span>
                      </div>
                      {food.portion_size && (
                        <p className="text-xs text-white/60 mt-1">
                          {food.portion_size}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Resumo Nutricional do Dia */}
                <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                  <p className="text-xs font-semibold text-white mb-2">
                    Resumo do Dia
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-white/60">Total Calorias</p>
                      <p className="font-bold text-white">
                        {selectedDay.foods.reduce((sum, f) => sum + (f.calories || 0), 0)} kcal
                      </p>
                    </div>
                    <div>
                      <p className="text-white/60">Total Proteína</p>
                      <p className="font-bold text-white">
                        {selectedDay.foods.reduce((sum, f) => sum + (f.protein || 0), 0)}g
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}