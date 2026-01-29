import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Crown } from "lucide-react";
import { format, startOfWeek, differenceInDays } from "date-fns";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import UserStatus from "../components/dashboard/UserStatus";
import PrimaryAction from "../components/dashboard/PrimaryAction";
import TodayGoals from "../components/dashboard/TodayGoals";
import WeekProgress from "../components/dashboard/WeekProgress";
import Achievements from "../components/dashboard/Achievements";
import QuickActionsGrid from "../components/dashboard/QuickActionsGrid";

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
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 10 * 60 * 1000,
  });

  // Show onboarding if user doesn't have a profile yet
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
    // After profile is created, show welcome modal for subscription
    setTimeout(() => setShowWelcome(true), 500);
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: todayFoods } = useQuery({
    queryKey: ['todayFoods', user?.email, today],
    queryFn: () => base44.entities.FoodLog.filter({ 
      user_email: user.email, 
      log_date: today 
    }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email, weekStart],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 3 * 60 * 1000,
  });

  const { data: todayWorkouts } = useQuery({
    queryKey: ['todayWorkouts', user?.email, today],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ 
        user_email: user.email,
        completed_date: today
      });
      return logs;
    },
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 2 * 60 * 1000,
  });

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 10 * 60 * 1000,
  });

  const { data: allWorkoutLogs } = useQuery({
    queryKey: ['allWorkoutLogs', user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: allFoodLogs } = useQuery({
    queryKey: ['allFoodLogs', user?.email],
    queryFn: () => base44.entities.FoodLog.filter({ user_email: user.email }),
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: completedChallenges } = useQuery({
    queryKey: ['completedChallenges', user?.email],
    queryFn: async () => {
      const challenges = await base44.entities.UserChallenge.filter({ 
        user_email: user.email,
        status: 'completed'
      });
      return challenges.length;
    },
    enabled: !!user?.email && !!profile,
    initialData: 0,
    staleTime: 10 * 60 * 1000,
  });

  const totalCaloriesBurned = allWorkoutLogs.reduce((sum, log) => sum + (log.calories_burned || 0), 0);
  
  const calculateStreak = () => {
    if (allWorkoutLogs.length === 0) return 0;
    
    const sortedDates = [...new Set(allWorkoutLogs.map(log => log.completed_date))].sort().reverse();
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const logDate = new Date(sortedDates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (logDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', user?.email, today],
    queryFn: async () => {
      const checkIns = await base44.entities.DailyCheckIn.filter({
        user_email: user.email,
        check_in_date: today
      });
      return checkIns[0] || null;
    },
    enabled: !!user?.email && !!profile,
    staleTime: 2 * 60 * 1000,
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || null;
    },
    enabled: !!user?.email && !!profile,
    staleTime: 5 * 60 * 1000,
  });

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.email, today],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.NutritionData.filter({
        user_email: user.email,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!user?.email && !!profile,
    staleTime: 2 * 60 * 1000,
  });

  const todayCalories = todayFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const todayProtein = todayFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
  const todayCarbs = todayFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  const todayFats = todayFoods.reduce((sum, food) => sum + (food.fats || 0), 0);
  const todayCaloriesBurned = todayWorkouts.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0);

  const calorieTarget = profile?.daily_calorie_target || 2000;
  const streakDays = weekWorkouts.length;

  // Calcular metas completas para Status Card
  const calorieProgress = calorieTarget > 0 ? (todayCalories / calorieTarget) * 100 : 0;
  const workoutComplete = todayWorkouts?.length > 0;
  const waterGoalReached = nutritionData?.water_goal_reached || false;
  const completedGoalsCount = [
    calorieProgress >= 100,
    workoutComplete,
    waterGoalReached
  ].filter(Boolean).length;

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const isFreeTrial = subscription?.plan === "free_trial";
  const daysLeft = subscription?.end_date 
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : 30;

  // Calculate weekly stats for goals
  const { data: weekNutrition = [] } = useQuery({
    queryKey: ['weekNutrition', user?.email, weekStart],
    queryFn: async () => {
      if (!user?.email) return [];
      const data = await base44.entities.NutritionData.filter({ user_email: user.email });
      return data.filter(d => d.log_date >= weekStart);
    },
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const { data: weekFoodLogs = [] } = useQuery({
    queryKey: ['weekFoodLogs', user?.email, weekStart],
    queryFn: async () => {
      if (!user?.email) return [];
      const logs = await base44.entities.FoodLog.filter({ user_email: user.email });
      return logs.filter(log => log.log_date >= weekStart);
    },
    enabled: !!user?.email && !!profile,
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const waterDaysCompleted = weekNutrition.filter(d => d.water_goal_reached === true).length;
  
  const proteinDaysCompleted = (() => {
    const daysByDate = {};
    weekFoodLogs.forEach(food => {
      if (!daysByDate[food.log_date]) {
        daysByDate[food.log_date] = 0;
      }
      daysByDate[food.log_date] += food.protein || 0;
    });
    
    const proteinTarget = profile?.protein_target || 150;
    return Object.values(daysByDate).filter(total => total >= proteinTarget * 0.9).length;
  })();

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-2xl mx-auto space-y-5">

        {showOnboarding && user && (
          <OnboardingModal 
            user={user}
            isOpen={showOnboarding}
            onComplete={handleOnboardingComplete}
          />
        )}

        {showWelcome && user && !showOnboarding && (
          <WelcomeModal 
            user={user} 
            onClose={() => setShowWelcome(false)} 
          />
        )}

        {/* Premium Badge */}
        {isPremium && (
          <div className="flex justify-end">
            <Link to={createPageUrl("Subscription")}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect cursor-pointer hover:scale-105 transition-transform border border-[#CEF17B]/20">
                <Crown className="w-4 h-4 text-[#CEF17B]" />
                <div className="text-xs">
                  <div className="font-bold text-white">
                    {isFreeTrial ? 'Teste Grátis' : 'Premium'}
                  </div>
                  <div className="text-[#CEEDB2]">{daysLeft} dias</div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {user && (
          <>
            {/* 1️⃣ STATUS DO USUÁRIO */}
            <UserStatus user={user} userPoints={userPoints} />

            {/* 2️⃣ AÇÃO PRINCIPAL DO DIA */}
            <PrimaryAction 
              hasCheckIn={!!todayCheckIn} 
              todayWorkouts={todayWorkouts}
              profile={profile}
            />

            {/* 3️⃣ METAS DE HOJE */}
            <TodayGoals 
              todayCalories={todayCalories}
              calorieTarget={calorieTarget}
              todayWorkouts={todayWorkouts}
              nutritionData={nutritionData}
            />

            {/* 4️⃣ PROGRESSO SEMANAL */}
            <WeekProgress 
              weekWorkouts={weekWorkouts.length}
              waterDays={waterDaysCompleted}
              proteinDays={proteinDaysCompleted}
            />

            {/* 5️⃣ CONQUISTAS */}
            <Achievements 
              achievements={achievements}
              workoutCount={allWorkoutLogs.length}
              streak={calculateStreak()}
            />

            {/* 6️⃣ AÇÕES RÁPIDAS */}
            <QuickActionsGrid />
          </>
        )}

      </div>
    </div>
  );
}