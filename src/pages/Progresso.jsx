import React, { useState, useEffect } from "react";
// page: Progresso
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, startOfWeek } from "date-fns";
import { Flame, Zap, Target, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import AchievementsGrid from "../components/progress/AchievementsGrid";
import { WorkoutsModal, CaloriesModal, StreakModal } from "../components/progress/StatsModals";

const RANK_META = {
  bronze:   { label: "Bronze",   color: "text-orange-400", bg: "bg-orange-400/20" },
  silver:   { label: "Prata",    color: "text-gray-300",   bg: "bg-gray-300/20" },
  gold:     { label: "Ouro",     color: "text-yellow-400", bg: "bg-yellow-400/20" },
  platinum: { label: "Platina",  color: "text-cyan-300",   bg: "bg-cyan-300/20" },
  diamond:  { label: "Diamante", color: "text-blue-300",   bg: "bg-blue-300/20" },
};

// Dynamic level calculation
function calcLevel(totalPoints) {
  if (totalPoints < 500) return { level: 1, xpCurrent: totalPoints, xpNext: 500 };
  if (totalPoints < 1500) return { level: 2, xpCurrent: totalPoints - 500, xpNext: 1000 };
  if (totalPoints < 3000) return { level: 3, xpCurrent: totalPoints - 1500, xpNext: 1500 };
  if (totalPoints < 5000) return { level: 4, xpCurrent: totalPoints - 3000, xpNext: 2000 };
  if (totalPoints < 8000) return { level: 5, xpCurrent: totalPoints - 5000, xpNext: 3000 };
  if (totalPoints < 12000) return { level: 6, xpCurrent: totalPoints - 8000, xpNext: 4000 };
  if (totalPoints < 17000) return { level: 7, xpCurrent: totalPoints - 12000, xpNext: 5000 };
  if (totalPoints < 23000) return { level: 8, xpCurrent: totalPoints - 17000, xpNext: 6000 };
  if (totalPoints < 30000) return { level: 9, xpCurrent: totalPoints - 23000, xpNext: 7000 };
  return { level: 10, xpCurrent: totalPoints - 30000, xpNext: 10000 };
}

export default function Progresso() {
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null); // "streak" | "workouts" | "calories"

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const pts = await base44.entities.UserPoints.filter({ user_email: user.email });
      return pts[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allWorkoutLogs = [] } = useQuery({
    queryKey: ['allWorkoutLogs', user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts = [] } = useQuery({
    queryKey: ['weekWorkouts', user?.email, weekStart],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekNutrition = [] } = useQuery({
    queryKey: ['weekNutrition', user?.email, weekStart],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({ user_email: user.email });
      return data.filter(d => d.log_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const calculateStreak = () => {
    if (allWorkoutLogs.length === 0) return 0;
    const sortedDates = [...new Set(allWorkoutLogs.map(log => log.completed_date))].sort().reverse();
    let streak = 0;
    const todayDate = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const logDate = new Date(sortedDates[i]);
      const expected = new Date(todayDate);
      expected.setDate(todayDate.getDate() - i);
      if (logDate.toDateString() === expected.toDateString()) streak++;
      else break;
    }
    return streak;
  };

  const streak = calculateStreak();
  const totalCaloriesBurned = allWorkoutLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  const totalPoints = userPoints?.total_points || 0;
  const { level, xpCurrent, xpNext } = calcLevel(totalPoints);
  const xpProgress = Math.round((xpCurrent / xpNext) * 100);
  const rank = userPoints?.rank || 'bronze';
  const rankInfo = RANK_META[rank] || RANK_META.bronze;
  const waterDays = weekNutrition.filter(d => d.water_goal_reached).length;
  const isActiveToday = allWorkoutLogs.some(l => l.completed_date === today);

  const statCards = [
    { icon: <Flame className="w-6 h-6 text-orange-400" />, value: streak, label: "dias seguidos", onClick: () => setModal("streak") },
    { icon: <Dumbbell className="w-6 h-6 text-[#CEF17B]" />, value: allWorkoutLogs.length, label: "treinos feitos", onClick: () => setModal("workouts") },
    { icon: <Zap className="w-6 h-6 text-yellow-400" />, value: `${Math.round(totalCaloriesBurned / 1000)}k`, label: "kcal queimadas", onClick: () => setModal("calories") },
  ];

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Meu Progresso</h1>
          <p className="text-[#CEEDB2] text-sm mt-1">Acompanhe sua evolução</p>
        </div>

        {/* Level & XP */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-[#CEF17B]/20 flex items-center justify-center relative ${isActiveToday ? "ring-2 ring-[#CEF17B]/60" : ""}`}>
                  {isActiveToday && (
                    <div className="absolute inset-0 rounded-2xl animate-pulse bg-[#CEF17B]/10" />
                  )}
                  <span className="text-2xl font-black text-[#CEF17B] relative z-10">{level}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Nível {level}</p>
                  <Badge className={`${rankInfo.bg} ${rankInfo.color} border-0 text-xs ${isActiveToday ? "animate-pulse" : ""}`}>
                    {rankInfo.label} {isActiveToday ? "• Ativo hoje ✓" : ""}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#CEF17B] font-bold text-lg">{totalPoints}</p>
                <p className="text-[#CEEDB2] text-xs">pontos totais</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#CEEDB2]">
                <span>XP: {xpCurrent}</span>
                <span>Faltam: {xpNext - xpCurrent} para Nível {level + 1}</span>
              </div>
              <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 0.8, ease: "easeOut" }}>
                <Progress value={xpProgress} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B] [&>div]:transition-all [&>div]:duration-1000" />
              </motion.div>
            </div>
          </Card>
        </motion.div>

        {/* Stat Cards — clicáveis */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-3 gap-3">
            {statCards.map((card, i) => (
              <button
                key={i}
                onClick={card.onClick}
                className="glass-effect border border-[#CEF17B]/20 p-4 rounded-xl text-center active:scale-95 transition-transform hover:bg-white/5"
              >
                <div className="flex justify-center mb-1">{card.icon}</div>
                <p className="text-2xl font-black text-white">{card.value}</p>
                <p className="text-[#CEEDB2] text-xs">{card.label}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Esta Semana */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="text-white font-bold">Esta Semana</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#CEEDB2]">Treinos</span>
                  <span className="text-white font-semibold">{weekWorkouts.length}/6</span>
                </div>
                <Progress value={(weekWorkouts.length / 6) * 100} className="h-2 bg-white/10 [&>div]:bg-[#CEF17B] [&>div]:transition-all [&>div]:duration-1000" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#CEEDB2]">Hidratação</span>
                  <span className="text-white font-semibold">{waterDays}/7 dias</span>
                </div>
                <Progress value={(waterDays / 7) * 100} className="h-2 bg-white/10 [&>div]:bg-blue-400 [&>div]:transition-all [&>div]:duration-1000" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Conquistas — biblioteca completa */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <AchievementsGrid achievements={achievements} />
          </Card>
        </motion.div>

        {/* Objetivo */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="text-white font-bold">Meu Objetivo</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#CEF17B]/10 flex items-center justify-center text-2xl">
                {profile?.goal === 'weight_loss' ? '🔥' : profile?.goal === 'muscle_gain' ? '💪' : '⚖️'}
              </div>
              <div>
                <p className="text-white font-semibold">
                  {profile?.goal === 'weight_loss' ? 'Emagrecimento' : profile?.goal === 'muscle_gain' ? 'Ganho de Massa' : 'Manutenção'}
                </p>
                <p className="text-[#CEEDB2] text-sm">
                  {profile?.fitness_level || 'Iniciante'} · {profile?.training_frequency || 3}x por semana
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

      </div>

      {/* Modais */}
      {modal === "streak" && <StreakModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
      {modal === "workouts" && <WorkoutsModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
      {modal === "calories" && <CaloriesModal logs={allWorkoutLogs} onClose={() => setModal(null)} />}
    </div>
  );
}