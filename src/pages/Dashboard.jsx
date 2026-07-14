import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/components/supabaseApi";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UtensilsCrossed, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfWeek } from "date-fns";
import HeroHeader from "../components/dashboard/HeroHeader";
import HeroAction from "../components/dashboard/HeroAction";
import TodayGoals from "../components/dashboard/TodayGoals";
import StreakWeeklyCard from "../components/dashboard/StreakWeeklyCard";
import WeeklyGoalModal from "../components/dashboard/WeeklyGoalModal";

// Minimal plan map to determine next workout (mirrors WeeklyPlan data)
const WEEK_PLANS = {
  1: {
    segunda: "Peito / Tríceps",
    terca: "Costas / Bíceps",
    quarta: "Pernas",
    quinta: "Costas / Bíceps",
    sexta: "Peito / Tríceps",
    sabado: "Ombro / Abdômen",
  },
  2: {
    segunda: "Peito / Ombro",
    terca: "Costas / Tríceps",
    quarta: "Costas / Ombro",
    quinta: "Peito / Tríceps",
    sexta: "Pernas",
    sabado: "Costas / Posterior",
  },
  3: {
    segunda: "Perna / Ombro",
    terca: "Peito / Tríceps",
    quarta: "Costas / Bíceps",
    quinta: "Peito / Tríceps",
    sexta: "Costas / Bíceps",
    sabado: "Perna / Ombro",
  },
  4: {
    segunda: "Peito / Tríceps",
    terca: "Costas / Bíceps",
    quarta: "Perna / Ombro",
    quinta: "Costas / Bíceps",
    sexta: "Perna / Ombro",
    sabado: "Peito / Tríceps",
  },
  5: {
    segunda: "Treino A - Inferiores",
    quarta: "Treino B - Inferiores",
    sexta: "Treino C - Inferiores",
  },
};

const PLAN_TITLES = {
  1: "Planilha 1 – Iniciante",
  2: "Planilha 2 – Intermediário",
  3: "Planilha 3 – Avançado",
  4: "Planilha 4 – Expert",
  5: "Planilha 5 – Feminino",
};

const DAY_LABELS = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
};

const DAY_ORDER = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

function getNextWorkout(dailyWorkouts) {
  if (!dailyWorkouts || dailyWorkouts.length === 0) return { nextWorkout: null, allDone: false };

  // Determine which week/planilha the user is using (most recent week_number used)
  const weekNumberCounts = {};
  dailyWorkouts.forEach(w => {
    weekNumberCounts[w.week_number] = (weekNumberCounts[w.week_number] || 0) + 1;
  });
  const weekNumber = parseInt(Object.entries(weekNumberCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 1);

  const planDays = WEEK_PLANS[weekNumber] || WEEK_PLANS[1];
  const planDayKeys = DAY_ORDER.filter(d => planDays[d]);

  // Get this week's completed days (week starts Monday)
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const completedThisWeek = new Set(
    dailyWorkouts
      .filter(w => w.completed && w.completed_date >= weekStart && w.week_number === weekNumber)
      .map(w => w.day_of_week)
  );

  const pendingDays = planDayKeys.filter(d => !completedThisWeek.has(d));

  if (pendingDays.length === 0) return { nextWorkout: null, allDone: true };

  const nextDay = pendingDays[0];
  return {
    nextWorkout: {
      day: nextDay,
      dayLabel: DAY_LABELS[nextDay],
      muscle: planDays[nextDay],
      planTitle: PLAN_TITLES[weekNumber],
      weekNumber,
    },
    allDone: false,
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      try {
        const profiles = await db.UserProfile.filter({ id: user.id });
        return profiles[0] || null;
      } catch (error) {
        console.error('[Dashboard] Erro ao buscar perfil:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayFoods = [] } = useQuery({
    queryKey: ['todayFoods', user?.id, today],
    queryFn: () => db.FoodLog.filter({ user_id: user.id, log_date: today }),
    enabled: !!user?.id && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.id, today],
    queryFn: () => db.WorkoutLog.filter({ user_id: user.id, completed_date: today }),
    enabled: !!user?.id && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.id, today],
    queryFn: async () => {
      const data = await db.NutritionData.filter({ user_id: user.id, log_date: today });
      return data[0] || null;
    },
    enabled: !!user?.id && !!profile,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all daily workouts to determine next workout
  const { data: allDailyWorkouts = [] } = useQuery({
    queryKey: ['allDailyWorkouts', user?.id],
    queryFn: () => db.DailyWorkout.filter({ user_id: user.id }),
    enabled: !!user?.id && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: userProgress } = useQuery({
    queryKey: ['userProgress', user?.id],
    queryFn: async () => {
      const list = await db.UserProgress.filter({ user_id: user.id });
      return list[0] ?? null;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const saveWeeklyGoalMutation = useMutation({
    mutationFn: async (goal) => {
      console.log('[Dashboard] Salvando meta semanal:', goal);
      if (userProgress?.id) {
        return db.UserProgress.update(userProgress.id, { weekly_goal: goal });
      } else if (user?.id) {
        return db.UserProgress.create({
          user_id: user.id,
          weekly_goal: goal,
        });
      }
    },
    onSuccess: () => {
      console.log('[Dashboard] Meta semanal salva com sucesso');
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      queryClient.invalidateQueries({ queryKey: ['userPoints'] });
      setShowGoalModal(false);
    },
    onError: (error) => {
      console.error('[Dashboard] Erro ao salvar meta semanal:', error);
      alert('Erro ao salvar meta. Por favor, tente novamente.');
    },
  });

  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const calorieTarget = profile?.daily_calorie_target || 2000;
  const waterProgress = nutritionData?.water_intake_ml && nutritionData?.water_goal_ml
    ? (nutritionData.water_intake_ml / nutritionData.water_goal_ml) * 100
    : 0;

  const { nextWorkout, allDone } = getNextWorkout(allDailyWorkouts);
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const completedWorkouts = allDailyWorkouts.filter((w) => w.completed);
  const weeklyCompleted = completedWorkouts.filter((w) => w.completed_date >= currentWeekStart).length;
  const completedDates = [...new Set(completedWorkouts.map((w) => w.completed_date).filter(Boolean))].sort().reverse();
  let currentStreak = 0;
  for (let i = 0; i < completedDates.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (new Date(completedDates[i]).toDateString() === expected.toDateString()) currentStreak++;
    else break;
  }
  const dashboardPoints = {
    daily_streak: currentStreak,
    longest_streak: Math.max(userProgress?.longest_streak || 0, currentStreak),
    weekly_goal: userProgress?.weekly_goal || 4,
    weekly_completed: weeklyCompleted,
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        {showGoalModal && (
          <WeeklyGoalModal
            currentGoal={userProgress?.weekly_goal || 4}
            onSave={(goal) => saveWeeklyGoalMutation.mutate(goal)}
            onClose={() => setShowGoalModal(false)}
          />
        )}
        {user && (
          <>
            {/* 1. Saudação */}
            <HeroHeader user={user} />

            {/* 2. Próximo treino inteligente + CTA */}
            <HeroAction nextWorkout={nextWorkout} allDone={allDone} />

            {/* 3. Streak + Meta Semanal */}
            <StreakWeeklyCard
              points={dashboardPoints}
              onEditGoal={() => setShowGoalModal(true)}
            />

            {/* 4. Status do dia */}
            <TodayGoals
              todayCalories={todayCalories}
              calorieTarget={calorieTarget}
              todayWorkouts={todayWorkouts}
              waterProgress={waterProgress}
            />

            {/* 5. Botões secundários */}
            <div className="grid grid-cols-2 gap-3">
              <Link to={createPageUrl("Progresso")}>
                <Button variant="outline" className="w-full h-12 glass-effect border-[#CEF17B]/20 text-[#CEF17B] hover:bg-[#CEF17B]/10 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Meu Progresso
                </Button>
              </Link>
              <Link to={createPageUrl("SmartNutrition")}>
                <Button variant="outline" className="w-full h-12 glass-effect border-[#CEF17B]/20 text-[#CEF17B] hover:bg-[#CEF17B]/10 text-sm font-semibold">
                  <UtensilsCrossed className="w-4 h-4 mr-2" />
                  Nutrição
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}