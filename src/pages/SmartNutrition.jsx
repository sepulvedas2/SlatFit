import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WaterGoalTracker from "../components/nutrition/WaterGoalTracker";
import MealGenerator from "../components/nutrition/MealGenerator";
import NutritionChatButton from "../components/nutrition/NutritionChatButton";

export default function SmartNutrition() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.email, today],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({ user_email: user.email, log_date: today });
      return data[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <p className="text-white">Faça login para acessar esta página.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 px-4 pt-8">
      <div className="max-w-lg mx-auto space-y-6">

        {/* 1. Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Nutrição Inteligente</h1>
          <p className="text-[#CEEDB2] text-sm">Simples, prática e personalizada para você.</p>
        </div>

        {/* 2. Gerador de Refeições com IA */}
        <Card className="glass-effect border-[#CEF17B]/20 p-5 space-y-4">
          <div>
            <h2 className="text-white font-bold text-lg">🥗 Gerar Refeições com IA</h2>
            <p className="text-[#CEEDB2] text-sm mt-0.5">
              Baseado no seu objetivo: <span className="text-[#CEF17B] font-semibold">
                {userProfile?.goal === "weight_loss" ? "Emagrecimento" : userProfile?.goal === "muscle_gain" ? "Hipertrofia" : "Manutenção"}
              </span>
            </p>
          </div>
          <MealGenerator userProfile={userProfile} />
        </Card>

        {/* 3. Meta de Água */}
        <WaterGoalTracker
          userEmail={user.email}
          nutritionData={nutritionData}
          userProfile={userProfile}
        />

        {/* 4. Biblioteca de conteúdos */}
        <Link to={createPageUrl("Learning")}>
          <Card className="glass-effect border-[#CEF17B]/20 p-5 cursor-pointer hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#CEF17B]/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-[#CEF17B]" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Biblioteca Nutricional</h3>
                  <p className="text-sm text-[#CEEDB2]">Aprenda sobre nutrição e saúde</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#CEF17B]" />
            </div>
          </Card>
        </Link>

      </div>

      {/* Chat flutuante */}
      <NutritionChatButton userProfile={userProfile} />
    </div>
  );
}