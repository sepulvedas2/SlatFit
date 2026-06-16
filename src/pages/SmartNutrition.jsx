import React from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronRight, Utensils } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import WaterGoalTracker from "../components/nutrition/WaterGoalTracker";
import MealGenerator from "../components/nutrition/MealGenerator";
import SlatFitAssistant from "../components/chat/SlatFitAssistant";

export default function SmartNutrition() {
  const { user } = useAuth();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: nutritionData } = useQuery({
    queryKey: ['nutritionData', user?.id, today],
    queryFn: async () => {
      const data = await db.NutritionData.filter({ user_id: user.id, log_date: today });
      return data[0] || null;
    },
    enabled: !!user?.id,
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: async () => {
      const profiles = await db.UserProfile.filter({ id: user.id });
      return profiles[0] || null;
    },
    enabled: !!user?.id,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-6 rounded-3xl text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(206,241,123,0.2)" }}>
          <p className="text-white">Faça login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  const goalLabel = {
    weight_loss: "Emagrecimento",
    muscle_gain: "Hipertrofia",
    maintenance: "Manutenção",
  }[userProfile?.goal] || "Manutenção";

  return (
    <div className="min-h-screen pb-28 pt-8">
      <div className="max-w-lg mx-auto px-4 space-y-6">

        {/* ── 1. CABEÇALHO ── */}
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">Nutrição Inteligente</h1>
          <p className="text-sm text-white/50">Simples, prática e personalizada para você.</p>
        </div>

        {/* ── 2. GERADOR DE REFEIÇÕES ── */}
        <div className="rounded-3xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(206,241,123,0.15)" }}>
          <div className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)" }}>
                <Utensils className="w-5 h-5 text-[#CEF17B]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Gerar Refeições com IA</h2>
                <p className="text-xs text-white/40">
                  Objetivo: <span className="text-[#CEF17B] font-semibold">{goalLabel}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <MealGenerator userProfile={userProfile} />
          </div>
        </div>

        {/* ── 3. HIDRATAÇÃO ── */}
        <WaterGoalTracker
          userId={user.id}
          nutritionData={nutritionData}
          userProfile={userProfile}
        />

        {/* ── 4. BIBLIOTECA ── */}
        <Link to={createPageUrl("Learning")} className="mt-4 block">
          <div
            className="rounded-3xl p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(206,241,123,0.15)" }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.12)" }}>
                <BookOpen className="w-6 h-6 text-[#CEF17B]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Biblioteca Nutricional</h3>
                <p className="text-xs text-white/40 mt-0.5">90 conteúdos · 9 categorias</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.07)" }}>
              <ChevronRight className="w-4 h-4 text-white/40" />
            </div>
          </div>
        </Link>

      </div>

      {/* Assistente SlatFit */}
      <SlatFitAssistant user={user} userProfile={userProfile} context="nutrition" />
    </div>
  );
}