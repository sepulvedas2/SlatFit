import React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, Dumbbell, Apple } from "lucide-react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function WeeklyActivity({ workouts, foods }) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getActivityForDay = (date) => {
    const hasWorkout = workouts.some(w => 
      isSameDay(new Date(w.completed_date), date)
    );
    const hasFoodLog = foods.some(f => 
      isSameDay(new Date(f.log_date), date)
    );
    
    return { hasWorkout, hasFoodLog };
  };

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-[#CEF17B]" />
        <h3 className="font-bold text-white">Atividade da Semana</h3>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const { hasWorkout, hasFoodLog } = getActivityForDay(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={index}
              className={`text-center p-3 rounded-lg ${
                isToday ? 'bg-[#CEF17B]/20 border border-[#CEF17B]/30' : 'bg-white/5'
              }`}
            >
              <p className="text-xs font-medium text-white/60 mb-2">
                {format(day, 'EEE', { locale: ptBR }).toUpperCase()}
              </p>
              <p className="text-sm font-bold text-white mb-2">
                {format(day, 'd')}
              </p>
              <div className="flex flex-col gap-1">
                {hasWorkout && (
                  <div className="w-6 h-6 rounded-full bg-[#CEF17B]/30 flex items-center justify-center mx-auto">
                    <Dumbbell className="w-3 h-3 text-[#CEF17B]" />
                  </div>
                )}
                {hasFoodLog && (
                  <div className="w-6 h-6 rounded-full bg-green-500/30 flex items-center justify-center mx-auto">
                    <Apple className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
            </div>
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
  );
}