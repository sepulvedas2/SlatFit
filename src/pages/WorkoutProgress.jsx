import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, Trophy, TrendingUp, Calendar, 
  CheckCircle, Target, Zap, Award, Flame, Clock, 
  Dumbbell, Activity, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, subWeeks, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProgressChart from "../components/progress/ProgressChart";
import WeeklyBarChart from "../components/progress/WeeklyBarChart";
import StatCard from "../components/progress/StatCard";

export default function WorkoutProgress() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });

  const { data: dailyWorkouts = [] } = useQuery({
    queryKey: ['dailyWorkouts', user?.email],
    queryFn: () => db.DailyWorkout.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  // Fetch workout logs for detailed stats
  const { data: workoutLogs = [] } = useQuery({
    queryKey: ['workoutLogs', user?.email],
    queryFn: () => db.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const currentWeekNumber = dailyWorkouts.reduce((max, workout) => Math.max(max, workout.week_number || 1), 1);
  const currentWeekEntries = dailyWorkouts.filter(w => (w.week_number || 1) === currentWeekNumber);
  const currentWeekCompleted = currentWeekEntries.filter(w => w.completed);
  const currentProgress = {
    week_number: currentWeekNumber,
    days_completed: currentWeekCompleted.map(w => w.day_of_week),
    progress_percentage: Math.round((currentWeekCompleted.length / 6) * 100),
  };
  const weekDays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const totalWorkouts = dailyWorkouts.filter(w => w.completed).length;
  const weekWorkouts = currentWeekCompleted.length;

  // Calculate detailed statistics
  const totalMinutes = workoutLogs.reduce((acc, log) => acc + (log.duration_minutes || 45), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const totalCalories = workoutLogs.reduce((acc, log) => acc + (log.calories_burned || 250), 0);
  const avgCaloriesPerWorkout = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
  const avgDuration = totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Calculate streak
  const calculateStreak = () => {
    const completedDates = dailyWorkouts
      .filter(w => w.completed && w.completed_date)
      .map(w => w.completed_date)
      .sort((a, b) => new Date(b) - new Date(a));
    
    if (completedDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toISOString().split('T')[0];
    const lastWorkout = completedDates[0];
    
    // Check if last workout was today or yesterday
    const daysDiff = Math.floor((new Date(today) - new Date(lastWorkout)) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1) return 0;
    
    for (let i = 1; i < completedDates.length; i++) {
      const diff = Math.floor((new Date(completedDates[i-1]) - new Date(completedDates[i])) / (1000 * 60 * 60 * 24));
      if (diff <= 2) streak++;
      else break;
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Data for weekly chart
  const weeklyChartData = [
    { name: "Sem 1", treinos: dailyWorkouts.filter(w => w.week_number === 1 && w.completed).length },
    { name: "Sem 2", treinos: dailyWorkouts.filter(w => w.week_number === 2 && w.completed).length },
    { name: "Sem 3", treinos: dailyWorkouts.filter(w => w.week_number === 3 && w.completed).length },
    { name: "Sem 4", treinos: dailyWorkouts.filter(w => w.week_number === 4 && w.completed).length },
  ];

  // Data for progress chart (last 7 days)
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayWorkouts = dailyWorkouts.filter(w => w.completed_date === dateStr);
      const dayLogs = workoutLogs.filter(w => w.completed_date === dateStr);
      
      data.push({
        name: format(date, 'EEE', { locale: ptBR }),
        treinos: dayWorkouts.length,
        calorias: dayLogs.reduce((acc, log) => acc + (log.calories_burned || 0), 0),
        minutos: dayLogs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0),
      });
    }
    return data;
  };

  const last7DaysData = getLast7DaysData();

  const stats = [
    { label: "Total de Treinos", value: totalWorkouts, subValue: `+${weekWorkouts} esta semana`, icon: Dumbbell, color: "bg-blue-500/20 text-blue-400" },
    { label: "Tempo Total", value: `${totalHours}h ${remainingMinutes}m`, subValue: `~${avgDuration}min por treino`, icon: Clock, color: "bg-green-500/20 text-green-400" },
    { label: "Calorias Queimadas", value: totalCalories.toLocaleString(), subValue: `~${avgCaloriesPerWorkout} por treino`, icon: Flame, color: "bg-orange-500/20 text-orange-400" },
    { label: "Sequência Atual", value: `${currentStreak} dias`, subValue: currentStreak > 3 ? "🔥 Em chamas!" : "Continue assim!", icon: Zap, color: "bg-purple-500/20 text-purple-400" },
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
          {stats.map((stat, index) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              subValue={stat.subValue}
              color={stat.color}
              delay={index * 0.1}
            />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Weekly Progress Chart */}
          <Card className="glass-effect border-[#CEF17B]/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="font-bold text-white">Treinos por Semana</h3>
            </div>
            <WeeklyBarChart data={weeklyChartData} />
          </Card>

          {/* Activity Chart */}
          <Card className="glass-effect border-[#CEF17B]/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="font-bold text-white">Últimos 7 Dias</h3>
            </div>
            <ProgressChart 
              data={last7DaysData} 
              dataKey="calorias" 
              title="Calorias"
              color="#f97316"
            />
          </Card>
        </div>

        {/* Week Progress Overview */}
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="font-bold text-white">Avanço nas Semanas</h3>
            </div>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
              Semana {currentProgress.week_number}
            </Badge>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((week) => {
              const weekCompleted = dailyWorkouts.filter(w => w.week_number === week && w.completed).length;
              const percentage = Math.round((weekCompleted / 6) * 100);
              const isCurrentWeek = week === currentProgress.week_number;
              
              return (
                <div key={week} className={`p-4 rounded-xl text-center transition-all ${
                  isCurrentWeek ? 'bg-[#CEF17B]/20 ring-2 ring-[#CEF17B]' : 'bg-white/5'
                }`}>
                  <p className="text-xs text-[#CEEDB2] mb-2">Semana {week}</p>
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="4"
                        fill="none"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={percentage === 100 ? "#22c55e" : "#CEF17B"}
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${percentage * 1.76} 176`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                      {percentage}%
                    </span>
                  </div>
                  <p className="text-xs text-white">{weekCompleted}/6</p>
                </div>
              );
            })}
          </div>
        </Card>

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

        {/* Achievement & Motivation */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Personal Records */}
          <Card className="glass-effect border-[#CEF17B]/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="font-bold text-white">Recordes Pessoais</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-[#CEEDB2] text-sm">Maior Sequência</span>
                <span className="text-white font-bold">{Math.max(currentStreak, 1)} dias</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-[#CEEDB2] text-sm">Melhor Semana</span>
                <span className="text-white font-bold">
                  {Math.max(...weeklyChartData.map(w => w.treinos))} treinos
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="text-[#CEEDB2] text-sm">Treino Mais Longo</span>
                <span className="text-white font-bold">
                  {workoutLogs.length > 0 ? Math.max(...workoutLogs.map(w => w.duration_minutes || 45)) : 45} min
                </span>
              </div>
            </div>
          </Card>

          {/* Motivation Card */}
          <Card className="glass-effect border-[#CEF17B]/20 p-6 flex flex-col items-center justify-center text-center">
            <Award className="w-16 h-16 text-[#CEF17B] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              {totalWorkouts >= 20 ? "Atleta Dedicado! 🏆" : 
               totalWorkouts >= 10 ? "Em Evolução! 💪" :
               totalWorkouts >= 5 ? "Bom Começo! 🌟" : "Vamos Começar! 🚀"}
            </h3>
            <p className="text-[#CEEDB2] text-sm mb-4">
              {totalWorkouts >= 20 
                ? `Incrível! ${totalWorkouts} treinos completados. Você é inspiração!`
                : totalWorkouts >= 10 
                ? `${totalWorkouts} treinos! Faltam ${20 - totalWorkouts} para o próximo nível.`
                : `Continue assim! Cada treino conta.`}
            </p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#CEF17B] to-green-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((totalWorkouts / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-2">{totalWorkouts}/20 para Atleta Dedicado</p>
          </Card>
        </div>

      </div>
    </div>
  );
}