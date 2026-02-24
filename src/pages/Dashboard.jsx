import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Crown } from "lucide-react";
import { format, startOfWeek, differenceInDays } from "date-fns";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import HeroHeader from "../components/dashboard/HeroHeader";
import HeroAction from "../components/dashboard/HeroAction";
import TodayGoals from "../components/dashboard/TodayGoals";

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
    if (user && profile === null) {
      setShowOnboarding(true);
    } else if (user && profile && subscription === null) {
      setShowWelcome(true);
    }
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

  const todayCalories = todayFoods.reduce((sum, f) => sum + (f.calories || 0), 0);
  const calorieTarget = profile?.daily_calorie_target || 2000;
  const waterProgress = nutritionData?.water_intake_ml && nutritionData?.water_goal_ml
    ? (nutritionData.water_intake_ml / nutritionData.water_goal_ml) * 100
    : 0;

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const isFreeTrial = subscription?.plan === "free_trial";
  const daysLeft = subscription?.end_date
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : 30;

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">

        {showOnboarding && user && (
          <OnboardingModal user={user} isOpen={showOnboarding} onComplete={handleOnboardingComplete} />
        )}
        {showWelcome && user && !showOnboarding && (
          <WelcomeModal user={user} onClose={() => setShowWelcome(false)} />
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="flex justify-end">
            <Link to={createPageUrl("Subscription")}>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-effect border border-[#CEF17B]/20 hover:scale-105 transition-transform cursor-pointer">
                <Crown className="w-3.5 h-3.5 text-[#CEF17B]" />
                <span className="text-xs font-bold text-white">{isFreeTrial ? 'Teste Grátis' : 'Premium'}</span>
                <span className="text-xs text-[#CEEDB2]">· {daysLeft}d</span>
              </div>
            </Link>
          </div>
        )}

        {user && profile && (
          <>
            {/* 1. Saudação */}
            <HeroHeader user={user} />

            {/* 2. Foco + CTA Principal */}
            <HeroAction todayWorkouts={todayWorkouts} />

            {/* 3. Status do Dia (3 indicadores) */}
            <TodayGoals
              todayCalories={todayCalories}
              calorieTarget={calorieTarget}
              todayWorkouts={todayWorkouts}
              waterProgress={waterProgress}
            />
          </>
        )}
      </div>
    </div>
  );
}