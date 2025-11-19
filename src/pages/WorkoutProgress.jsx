import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Trophy, TrendingUp, Calendar, 
  CheckCircle, Target, Zap, Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function WorkoutProgress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const { data: weeklyProgress } = useQuery({
    queryKey: ['weeklyProgress', user?.email],
    queryFn: () => base44.entities.WeeklyProgress.filter({ 
      user_email: user.email,
      current_week: true 
    }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: dailyWorkouts } = useQuery({
    queryKey: ['dailyWorkouts', user?.email],
    queryFn: () => base44.entities.DailyWorkout.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const currentProgress = weeklyProgress[0] || { progress_percentage: 0, days_completed: [], week_number: 1 };
  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const totalWorkouts = dailyWorkouts.filter(w => w.completed).length;
  const weekWorkouts = dailyWorkouts.filter(w => 
    w.week_number === currentProgress.week_number && w.completed
  ).length;

  const stats = [
    { label: "Semana Atual", value: `Semana ${currentProgress.week_number}`, icon: Calendar, color: "bg-blue-500/20 text-blue-400" },
    { label: "Progresso", value: `${Math.round(currentProgress.progress_percentage)}%`, icon: TrendingUp, color: "bg-green-500/20 text-green-400" },
    { label: "Esta Semana", value: `${weekWorkouts}/6`, icon: CheckCircle, color: "bg-purple-500/20 text-purple-400" },
    { label: "Total Treinos", value: totalWorkouts, icon: Trophy, color: "bg-orange-500/20 text-orange-400" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Workouts")}>
            <Button variant="outline" size="icon" className="glass-effect border-[#CEF17B]/20">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Meu Progresso</h1>
            <p className="text-[#CEEDB2]">Acompanhe sua evolução semanal</p>
          </div>
          <Trophy className="w-8 h-8 text-[#CEF17B]" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-effect border-[#CEF17B]/20 p-4">
                  <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-[#CEEDB2]">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly Progress Bar */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white">Progresso da Semana</h3>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
              {Math.round(currentProgress.progress_percentage)}%
            </Badge>
          </div>
          <Progress value={currentProgress.progress_percentage} className="h-3 mb-4" />
          <p className="text-sm text-[#CEEDB2]">
            Continue assim! {6 - weekWorkouts} treino(s) restante(s) esta semana.
          </p>
        </Card>

        {/* Weekly Calendar */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <h3 className="font-bold text-white mb-4">Calendário Semanal</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {weekDays.map((day, index) => {
              const dayDate = addDays(weekStart, index);
              const dayName = day.toLowerCase().replace('ç', 'c').replace('á', 'a');
              const isCompleted = currentProgress.days_completed?.includes(dayName) || false;
              const isToday = format(dayDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

              return (
                <div
                  key={day}
                  className={`p-4 rounded-lg border text-center transition-all ${
                    isCompleted 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : isToday
                      ? 'bg-blue-500/20 border-blue-500/30'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <p className="text-xs text-white/60 mb-2">{day}</p>
                  <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500/30' : 'bg-white/10'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <span className="text-xs text-white/60">{format(dayDate, 'd')}</span>
                    )}
                  </div>
                  <p className="text-xs text-[#CEEDB2] mt-2">
                    {isCompleted ? '✓' : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Workouts */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <h3 className="font-bold text-white mb-4">Treinos Recentes</h3>
          <div className="space-y-3">
            {dailyWorkouts
              .filter(w => w.completed)
              .sort((a, b) => new Date(b.completed_date) - new Date(a.completed_date))
              .slice(0, 5)
              .map((workout, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-white font-semibold text-sm">{workout.muscle_group}</p>
                      <p className="text-xs text-[#CEEDB2]">
                        {format(new Date(workout.completed_date), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                    Semana {workout.week_number}
                  </Badge>
                </div>
              ))}
            {dailyWorkouts.filter(w => w.completed).length === 0 && (
              <p className="text-center text-white/60 py-8">
                Nenhum treino concluído ainda. Vamos começar! 💪
              </p>
            )}
          </div>
        </Card>

        {/* Motivation Card */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6 text-center">
          <Award className="w-12 h-12 text-[#CEF17B] mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Continue Forte!</h3>
          <p className="text-[#CEEDB2] text-sm">
            Cada treino é um passo mais perto dos seus objetivos.
          </p>
        </Card>

      </div>
    </div>
  );
}