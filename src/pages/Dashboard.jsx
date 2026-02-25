import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UtensilsCrossed, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfWeek } from "date-fns";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import HeroHeader from "../components/dashboard/HeroHeader";
import HeroAction from "../components/dashboard/HeroAction";
import TodayGoals from "../components/dashboard/TodayGoals";

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
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (user && profile === null) setShowOnboarding(true);
    else if (user && profile && subscription === null) setShowWelcome(true);
  }, [user, profile, subscription]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    queryClient.invalidateQueries(['userProfile']);
    setTimeout(() => setShowWelcome(true), 500);
  };

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayFoods = [] } = useQuery({
    queryKey: ['todayFoods', user?.email, today],
    queryFn: () => base44.entities.FoodLog.filter({ user_email: user.email, log_date: today }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.email, today],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email, completed_date: today }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.email, today],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({ user_email: user.email, log_date: today });
      return data[0] || null;
    },
    enabled: !!user?.email && !!profile,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch all daily workouts to determine next workout
  const { data: allDailyWorkouts = [] } = useQuery({
    queryKey: ['allDailyWorkouts', user?.email],
    queryFn: () => base44.entities.DailyWorkout.filter({ user_email: user.email }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const calorieTarget = profile?.daily_calorie_target || 2000;
  const waterProgress = nutritionData?.water_intake_ml && nutritionData?.water_goal_ml
    ? (nutritionData.water_intake_ml / nutritionData.water_goal_ml) * 100
    : 0;

  const { nextWorkout, allDone } = getNextWorkout(allDailyWorkouts);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        {showOnboarding && user && (
          <OnboardingModal user={user} isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
        )}
        {showWelcome && user && !showOnboarding && (
          <WelcomeModal user={user} onClose={() => setShowWelcome(false)} />
        )}

        {user && profile && (
          <>
            {/* 1. Saudação */}
            <HeroHeader user={user} />

            {/* 2. Próximo treino inteligente + CTA */}
            <HeroAction nextWorkout={nextWorkout} allDone={allDone} />

            {/* 3. Status do dia */}
            <TodayGoals
              todayCalories={todayCalories}
              calorieTarget={calorieTarget}
              todayWorkouts={todayWorkouts}
              waterProgress={waterProgress}
            />

            {/* 4. Botões secundários */}
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