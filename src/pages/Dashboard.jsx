
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Crown, Camera, Dumbbell, Apple, Target, 
  CheckCircle, Zap, Trophy, Users
} from "lucide-react";
import { format, startOfWeek, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import AIFitLensCoach from "../components/dashboard/AIFitLensCoach";
import QuickStats from "../components/dashboard/QuickStats";
import MacroProgress from "../components/dashboard/MacroProgress";
import WeeklyActivity from "../components/dashboard/WeeklyActivity";
import Achievements from "../components/dashboard/Achievements";
import SubscriptionStatus from "../components/dashboard/SubscriptionStatus";
import WelcomeModal from "../components/onboarding/WelcomeModal";
import DailyMissions from "../components/dashboard/DailyMissions";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

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

  // Check if user is new and needs welcome
  useEffect(() => {
    // Only show welcome if user is loaded and subscription data is loaded,
    // and if there's no subscription associated with the user.
    // We also need to make sure `subscription` is explicitly `null` or `undefined`
    // (not just an empty array or object if API returns that for no subscription).
    // The queryFn already returns null if no subscription is found.
    if (user && subscription === null) {
      setShowWelcome(true);
    }
  }, [user, subscription]);

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
    queryKey: ['weekWorkouts', user?.email],
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

  // NEW: Check-in status
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

  // NEW: User points
  const { data: userPoints } = useQuery({
    queryKey: ['userPoints', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user.email });
      return points[0] || null;
    },
    enabled: !!user?.email
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
    : 30; // Default to 30 days if no subscription end date

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              Olá, {user?.full_name?.split(' ')[0] || 'Atleta'}! 👋
            </h1>
            <p className="text-[#CEEDB2] mt-1 text-sm md:text-base">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Level Badge */}
            {userPoints && (
              <div className="glass-effect px-4 py-2 rounded-full border border-[#CEF17B]/20">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#CEF17B]" />
                  <div className="text-xs">
                    <div className="font-bold text-white">Nível {userPoints.level}</div>
                    <div className="text-[#CEEDB2]">{userPoints.xp_current}/{userPoints.xp_next_level} XP</div>
                  </div>
                </div>
              </div>
            )}

            {isPremium && (
              <Link to={createPageUrl("Subscription")}>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-effect cursor-pointer hover:scale-105 transition-transform">
                  <Crown className="w-4 h-4 text-[#CEF17B]" />
                  <div className="text-xs">
                    <div className="font-bold text-white">
                      {isFreeTrial ? 'Teste Grátis' : 'Premium'}
                    </div>
                    <div className="text-[#CEEDB2]">
                      {daysLeft} dias restantes
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>

        <SubscriptionStatus />

        {showWelcome && user && (
          <WelcomeModal 
            user={user} 
            onClose={() => setShowWelcome(false)} 
          />
        )}

        {/* NEW: Daily Check-in CTA */}
        {!todayCheckIn && (
          <Link to={createPageUrl("CheckIn")}>
            <Card className="gradient-card border-0 p-6 cursor-pointer hover:scale-[1.02] transition-all shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#084734]/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#084734]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#084734]">
                      Faça seu Check-in Diário! 🎯
                    </h3>
                    <p className="text-[#084734]/70 text-sm mt-1">
                      Como você está hoje? A IA vai ajustar seu treino! (+10 XP)
                    </p>
                  </div>
                </div>
                <Button className="bg-[#084734] text-[#CEF17B] hover:bg-[#084734]/90">
                  Começar
                </Button>
              </div>
            </Card>
          </Link>
        )}

        {/* NEW: Daily Missions */}
        <DailyMissions userEmail={user?.email} />

        <AIFitLensCoach 
          userName={user?.full_name?.split(' ')[0]}
          streakDays={streakDays}
          todayCalories={todayCalories}
          calorieTarget={calorieTarget}
        />

        <QuickStats
          todayCalories={todayCalories}
          calorieTarget={calorieTarget}
          todayProtein={todayProtein}
          proteinTarget={profile?.protein_target || 150}
          weekWorkouts={weekWorkouts.length}
          currentWeight={profile?.current_weight}
          targetWeight={profile?.target_weight}
        />

        <MacroProgress
          protein={todayProtein}
          carbs={todayCarbs}
          fats={todayFats}
          proteinTarget={profile?.protein_target}
          carbsTarget={profile?.carbs_target}
          fatsTarget={profile?.fats_target}
        />

        <WeeklyActivity workouts={weekWorkouts} foods={todayFoods} />

        <Achievements achievements={achievements} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to={createPageUrl("FoodScanner")}>
            <Card className="glass-effect p-4 hover:scale-105 transition-all cursor-pointer border-[#CEF17B]/20">
              <Camera className="w-8 h-8 text-[#CEF17B] mb-2" />
              <p className="text-sm font-semibold text-white">Escanear</p>
              <p className="text-xs text-[#CEEDB2]">Alimento</p>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Workouts")}>
            <Card className="glass-effect p-4 hover:scale-105 transition-all cursor-pointer border-[#CEF17B]/20">
              <Dumbbell className="w-8 h-8 text-[#CEF17B] mb-2" />
              <p className="text-sm font-semibold text-white">Novo</p>
              <p className="text-xs text-[#CEEDB2]">Treino</p>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Challenges")}>
            <Card className="glass-effect p-4 hover:scale-105 transition-all cursor-pointer border-[#CEF17B]/20">
              <Trophy className="w-8 h-8 text-[#CEF17B] mb-2" />
              <p className="text-sm font-semibold text-white">Desafios</p>
              <p className="text-xs text-[#CEEDB2]">Ativos</p>
            </Card>
          </Link>
          
          <Link to={createPageUrl("Community")}>
            <Card className="glass-effect p-4 hover:scale-105 transition-all cursor-pointer border-[#CEF17B]/20">
              <Users className="w-8 h-8 text-[#CEF17B] mb-2" />
              <p className="text-sm font-semibold text-white">Comunidade</p>
              <p className="text-xs text-[#CEEDB2]">Rankings</p>
            </Card>
          </Link>
        </div>

      </div>
    </div>
  );
}
