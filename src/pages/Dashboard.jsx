import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  CheckCircle, Crown
} from "lucide-react";
import { format, startOfWeek, differenceInDays } from "date-fns";
import UserGreeting from "../components/dashboard/UserGreeting";
import DailyMissions from "../components/dashboard/DailyMissions";
import PointsCard from "../components/dashboard/PointsCard";
import WeeklyGoals from "../components/dashboard/WeeklyGoals";
import Achievements from "../components/dashboard/Achievements";
import QuickActions from "../components/dashboard/QuickActions";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";

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
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  // Show onboarding first if user doesn't have a profile yet
  useEffect(() => {
    if (user && profile === null && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, profile]);

  // Show welcome modal only after profile exists and no subscription
  useEffect(() => {
    if (user && profile && subscription === null && !showOnboarding) {
      setShowWelcome(true);
    }
  }, [user, profile, subscription, showOnboarding]);

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
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email, weekStart], // Changed here
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', user?.email, today],
    queryFn: async () => {
      const checkIns = await base44.entities.DailyCheckIn.filter({
        user_email: user.email,
        check_in_date: today
      });
      return checkIns[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || null;
    },
    enabled: !!user?.email
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
    enabled: !!user?.email,
  });

  const todayCalories = todayFoods.reduce((sum, food) => sum + (food.calories || 0), 0);
  const todayProtein = todayFoods.reduce((sum, food) => sum + (food.protein || 0), 0);
  const todayCarbs = todayFoods.reduce((sum, food) => sum + (food.carbs || 0), 0);
  const todayFats = todayFoods.reduce((sum, food) => sum + (food.fats || 0), 0);

  const calorieTarget = profile?.daily_calorie_target || 2000;
  const streakDays = weekWorkouts.length;

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
    enabled: !!user?.email,
    initialData: [],
  });

  const waterDaysCompleted = weekNutrition.filter(d => d.water_goal_reached).length;
  const proteinDaysCompleted = weekNutrition.filter(d => {
    const dailyProtein = todayFoods
      .filter(f => f.log_date === d.log_date)
      .reduce((sum, f) => sum + (f.protein || 0), 0);
    return dailyProtein >= (profile?.protein_target || 150) * 0.9;
  }).length;

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">

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

        {/* Premium Badge (Top Right) */}
        {isPremium && (
          <div className="flex justify-end">
            <Link to={createPageUrl("Subscription")}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect cursor-pointer hover:scale-105 transition-transform border border-[#CEF17B]/20">
                <Crown className="w-4 h-4 text-[#CEF17B]" />
                <div className="text-xs">
                  <div className="font-bold text-white">
                    {isFreeTrial ? 'Teste Grátis' : 'Premium'}
                  </div>
                  <div className="text-[#CEEDB2]">
                    {daysLeft} dias
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 1. User Greeting */}
        <UserGreeting userName={user?.full_name?.split(' ')[0] || 'Atleta'} />

        {/* Check-in Reminder */}
        {!todayCheckIn && (
          <Link to={createPageUrl("CheckIn")}>
            <Card className="gradient-card border-0 p-5 cursor-pointer hover:scale-[1.02] transition-all shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#084734]/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#084734]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#084734]">
                      Faça seu Check-in Diário! 🎯
                    </h3>
                    <p className="text-[#084734]/70 text-xs mt-0.5">
                      A IA vai ajustar seu treino! (+10 XP)
                    </p>
                  </div>
                </div>
                <Button className="bg-[#084734] text-[#CEF17B] hover:bg-[#084734]/90 text-sm">
                  Começar
                </Button>
              </div>
            </Card>
          </Link>
        )}

        {/* 2. Daily Mission */}
        <DailyMissions userEmail={user?.email} />

        {/* 3. Points Card */}
        <PointsCard userPoints={userPoints} />

        {/* 4. Weekly Goals */}
        <WeeklyGoals 
          weekWorkouts={weekWorkouts.length}
          waterDays={waterDaysCompleted}
          proteinDays={proteinDaysCompleted}
        />

        {/* 5. Achievements */}
        <Achievements achievements={achievements} />

        {/* 6. Quick Actions */}
        <QuickActions />

      </div>
    </div>
  );
}