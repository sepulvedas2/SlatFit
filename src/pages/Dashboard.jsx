import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  CheckCircle, Crown, Flame
} from "lucide-react";
import { format, startOfWeek, differenceInDays } from "date-fns";
import UserGreeting from "../components/dashboard/UserGreeting";
import DailyMissions from "../components/dashboard/DailyMissions";
import PointsCard from "../components/dashboard/PointsCard";
import WeeklyGoals from "../components/dashboard/WeeklyGoals";
import AchievementSystem from "../components/dashboard/AchievementSystem";
import QuickActions from "../components/dashboard/QuickActions";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import OnboardingModal from "../components/onboarding/OnboardingModal";
import IAGOCoach from "../components/dashboard/IAGOCoach";

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
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email, weekStart],
    queryFn: async () => {
      const logs = await base44.entities.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
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
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: achievements } = useQuery({
    queryKey: ['achievements', user?.email],
    queryFn: () => base44.entities.Achievement.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allWorkoutLogs } = useQuery({
    queryKey: ['allWorkoutLogs', user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: allFoodLogs } = useQuery({
    queryKey: ['allFoodLogs', user?.email],
    queryFn: () => base44.entities.FoodLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
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
    enabled: !!user?.email,
    initialData: 0,
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
  const todayCaloriesBurned = todayWorkouts.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0);

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

  const { data: weekFoodLogs = [] } = useQuery({
    queryKey: ['weekFoodLogs', user?.email, weekStart],
    queryFn: async () => {
      if (!user?.email) return [];
      const logs = await base44.entities.FoodLog.filter({ user_email: user.email });
      return logs.filter(log => log.log_date >= weekStart);
    },
    enabled: !!user?.email,
    initialData: [],
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

        {/* AI Coach */}
        <IAGOCoach 
          user={user}
          profile={profile}
          todayCheckIn={todayCheckIn}
          weekWorkouts={weekWorkouts}
          todayCalories={todayCalories}
          calorieTarget={calorieTarget}
          userPoints={userPoints}
        />

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

        {/* Calories Burned Today */}
        <Card className="glass-effect border-orange-500/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                <Flame className="w-8 h-8 text-orange-400" />
              </div>
              <div>
                <p className="text-white/60 text-sm mb-1">Calorias Queimadas Hoje</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-white">{todayCaloriesBurned}</p>
                  <p className="text-orange-400 text-sm">kcal</p>
                </div>
              </div>
            </div>
            {todayCaloriesBurned > 0 && (
              <div className="text-right">
                <p className="text-xs text-white/60 mb-1">Treinos hoje</p>
                <p className="text-2xl font-bold text-[#CEF17B]">{todayWorkouts.length}</p>
              </div>
            )}
          </div>
          {todayCaloriesBurned === 0 && (
            <p className="text-center text-white/40 text-sm mt-4">
              Comece um treino HIIT para queimar calorias! 🔥
            </p>
          )}
        </Card>

        {/* 3. Points Card */}
        <PointsCard userPoints={userPoints} />

        {/* 4. Weekly Goals */}
        <WeeklyGoals 
          weekWorkouts={weekWorkouts.length}
          waterDays={waterDaysCompleted}
          proteinDays={proteinDaysCompleted}
        />

        {/* 5. Achievements */}
        <AchievementSystem
          userEmail={user?.email}
          achievements={achievements}
          workoutCount={allWorkoutLogs.length}
          streak={calculateStreak()}
          totalCalories={totalCaloriesBurned}
          foodLogCount={allFoodLogs.length}
          userLevel={userPoints?.level || 1}
          completedChallenges={completedChallenges}
          proteinDaysCount={proteinDaysCompleted}
          waterDaysCount={waterDaysCompleted}
        />

        {/* 6. Quick Actions */}
        <QuickActions />

      </div>
    </div>
  );
}