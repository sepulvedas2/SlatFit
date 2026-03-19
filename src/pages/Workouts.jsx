import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import WeeklyPlan from "../components/workouts/WeeklyPlan";
import MyWorkouts from "../components/workouts/MyWorkouts";

import WorkoutAICoach from "../components/workouts/WorkoutAICoach";
import SlatFitAssistant from "../components/chat/SlatFitAssistant";

export default function Workouts() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("app-workouts");
  const [selectedWeek, setSelectedWeek] = useState(1);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        const profiles = await db.UserProfile.filter({ user_email: user.email });
        return profiles[0] || null;
      } catch (error) {
        console.error('[Workouts] Erro ao buscar perfil:', error);
        return null;
      }
    },
    enabled: !!user?.email,
    retry: 1,
  });

  const { data: todayWorkouts = [] } = useQuery({
    queryKey: ['todayWorkouts', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const logs = await db.WorkoutLog.filter({ 
        user_email: user.email,
        completed_date: today
      });
      return logs;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const { data: weekWorkouts } = useQuery({
    queryKey: ['weekWorkouts', user?.email],
    queryFn: async () => {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const logs = await db.WorkoutLog.filter({ user_email: user.email });
      return logs.filter(log => log.completed_date >= weekStartStr);
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Fetch global exercise images once
  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => db.Exercise.list(),
    initialData: [],
    staleTime: 5 * 60 * 1000,
  });

  const exerciseImageMap = useMemo(() => {
    return exercises.reduce((acc, exercise) => {
      if (exercise?.name && exercise?.image_url) {
        acc[exercise.name] = exercise.image_url;
      }
      return acc;
    }, {});
  }, [exercises]);

  // Fetch daily workouts
  const { data: dailyWorkouts = [] } = useQuery({
    queryKey: ['dailyWorkouts', user?.email, selectedWeek],
    queryFn: () => db.DailyWorkout.filter({ 
      user_email: user.email,
      week_number: selectedWeek 
    }),
    enabled: !!user?.email,
    initialData: [],
  });





  const completeDayMutation = useMutation({
    mutationFn: async ({ weekNumber, dayOfWeek }) => {
      console.log('[Workouts] Completando dia:', dayOfWeek, 'semana:', weekNumber);
      
      // Verificar se já existe
      const existing = dailyWorkouts.find(w => w.day_of_week === dayOfWeek);
      let result;
      
      if (existing) {
        console.log('[Workouts] Atualizando treino existente:', existing.id);
        result = await db.DailyWorkout.update(existing.id, { 
          completed: true, 
          completed_date: new Date().toISOString().split('T')[0],
          xp_earned: 50
        });
      } else {
        console.log('[Workouts] Criando novo treino concluído');
        result = await db.DailyWorkout.create({
          user_email: user.email,
          week_number: weekNumber,
          day_of_week: dayOfWeek,
          muscle_group: "treino",
          completed: true,
          completed_date: new Date().toISOString().split('T')[0],
          xp_earned: 50
        });
      }

      return result;
    },
    onSuccess: () => {
      console.log('[Workouts] Treino salvo com sucesso');
      queryClient.invalidateQueries(['dailyWorkouts']);
      queryClient.invalidateQueries(['weekWorkouts']);
      queryClient.invalidateQueries(['todayWorkouts']);
      queryClient.invalidateQueries(['allDailyWorkouts']);
    },
    onError: (error) => {
      console.error('[Workouts] Erro ao salvar treino:', error);
      alert('Erro ao salvar treino. Por favor, tente novamente.');
    }
  });

  const handleCompleteDay = (weekNumber, dayOfWeek) => {
    if (user) {
      completeDayMutation.mutate({ weekNumber, dayOfWeek });
    }
  };

  // Weekly Plan View (Main View)
    const weekOptions = [
      { number: 1, title: "Planilha 1", subtitle: "Iniciante" },
      { number: 2, title: "Planilha 2", subtitle: "Intermediário" },
      { number: 3, title: "Planilha 3", subtitle: "Avançado" },
      { number: 4, title: "Planilha 4", subtitle: "Expert" },
      { number: 5, title: "Planilha 5", subtitle: "Feminino | Inferiores (ABC)" }
    ];

    const weekDescriptions = {
      1: "Treino base para iniciantes",
      2: "Aumente a intensidade",
      3: "Desafio de alto nível",
      4: "Para atletas experientes",
      5: "Foco em membros inferiores"
    };

    return (
      <div className="min-h-screen p-4 md:p-6" style={{ position: "relative" }}>
        <SlatFitAssistant user={user} userProfile={profile} context="workout" />
        <div className="max-w-4xl mx-auto space-y-7">

          {/* Header */}
          <div className="flex items-start justify-between pt-2">
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">Treinos</h1>
              <p className="text-[#CEEDB2]/80 text-sm mt-1">Prontos ou crie os seus 💪</p>
            </div>
            <Link to={createPageUrl("WorkoutProgress")}>
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-[#CEF17B] transition-all active:scale-95"
                style={{ background: "rgba(206,241,123,0.1)", border: "1px solid rgba(206,241,123,0.25)" }}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Meu Progresso</span>
              </button>
            </Link>
          </div>

          {/* Segmented Control */}
          <div
            className="flex p-1 rounded-2xl gap-1"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            {[
              { value: "app-workouts", label: "Planilhas do App" },
              { value: "my-workouts", label: "Meus Treinos" }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
                style={activeTab === tab.value
                  ? { background: "linear-gradient(135deg, #FF6A00, #FF8C00)", color: "white", boxShadow: "0 2px 12px rgba(255,106,0,0.35)" }
                  : { color: "rgba(255,255,255,0.45)" }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "my-workouts" && (
            <MyWorkouts userEmail={user?.email} />
          )}

          {activeTab === "app-workouts" && <div className="space-y-7">

          {/* 1. Planilha Selector */}
          <div>
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3 px-0.5">Escolha sua planilha</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {weekOptions.map((week) => (
                <motion.div
                  key={week.number}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedWeek(week.number)}
                  className="cursor-pointer"
                >
                  <div
                    className="p-4 rounded-2xl transition-all duration-200"
                    style={selectedWeek === week.number
                      ? { background: "rgba(206,241,123,0.12)", border: "1.5px solid #CEF17B", boxShadow: "0 0 16px rgba(206,241,123,0.15)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(206,241,123,0.15)" }
                    }
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        selectedWeek === week.number ? 'bg-[#CEF17B]/25' : 'bg-white/8'
                      }`} style={{ background: selectedWeek === week.number ? "rgba(206,241,123,0.2)" : "rgba(255,255,255,0.06)" }}>
                        <span className="text-[#CEF17B] font-bold text-base">{week.number}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm leading-tight">{week.title}</h3>
                        <p className="text-xs text-[#CEF17B]/70 mt-0.5">{week.subtitle}</p>
                        <p className="text-xs text-white/40 mt-1 leading-tight hidden md:block">{weekDescriptions[week.number]}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. Treinos da Semana */}
          <div id="weekly-plan-section">
            <WeeklyPlan 
              weekNumber={selectedWeek}
              dailyWorkouts={dailyWorkouts}
              onCompleteDay={handleCompleteDay}
              exerciseImageMap={exerciseImageMap}
            />
          </div>

          {/* 3. Personal Trainer IA (accordion) */}
          <WorkoutAICoach 
             profile={profile}
             weekWorkouts={weekWorkouts}
             onStartWorkout={(workoutType) => {
               setTimeout(() => {
                 const weeklyPlanElement = document.getElementById('weekly-plan-section');
                 if (weeklyPlanElement) {
                   weeklyPlanElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                 }
               }, 100);
             }}
           />

          <div
            className="rounded-2xl p-3 text-center"
            style={{ background: "rgba(206,241,123,0.05)", border: "1px solid rgba(206,241,123,0.12)" }}
          >
            <p className="text-sm text-[#CEEDB2]/70">
              💡 Toque em cada dia para ver os exercícios detalhados
            </p>
          </div>

          </div>}

        </div>
      </div>
    );
}