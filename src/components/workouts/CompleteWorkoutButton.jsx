import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const XP_BY_INTENSITY = {
  leve: 30,
  moderado: 60,
  intenso: 100,
};

function extractIntensity(observacoes = "") {
  const obs = observacoes.toLowerCase();
  if (obs.includes("intenso")) return "intenso";
  if (obs.includes("moderado")) return "moderado";
  return "leve";
}

export default function CompleteWorkoutButton({ workout, exercises, userEmail, onCompleted }) {
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const queryClient = useQueryClient();

  const handleComplete = async () => {
    if (!userEmail) return;
    setLoading(true);

    const intensity = extractIntensity(workout.observacoes);
    const xp = XP_BY_INTENSITY[intensity];

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Calcular semana atual (ISO week key YYYY-WW)
    const d = new Date();
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
    const currentWeekKey = `${d.getFullYear()}-${String(weekNum).padStart(2, "0")}`;

    // Save workout log
    await base44.entities.WorkoutLog.create({
      user_email: userEmail,
      workout_id: workout.id,
      workout_name: workout.nome_treino,
      completed_date: today,
      duration_minutes: 55,
      calories_burned: intensity === "intenso" ? 400 : intensity === "moderado" ? 280 : 180,
    });

    // Update XP + rank + streak + weekly
    const pointsList = await base44.entities.UserPoints.filter({ user_email: userEmail });
    const RANKS = [
      { key: "bronze", minXP: 0 },
      { key: "silver", minXP: 500 },
      { key: "gold", minXP: 1500 },
      { key: "platinum", minXP: 3500 },
      { key: "diamond", minXP: 7000 },
    ];

    if (pointsList[0]) {
      const p = pointsList[0];
      const newTotal = (p.total_points || 0) + xp;
      const newXP = (p.xp_current || 0) + xp;
      const newRank = [...RANKS].reverse().find(r => newTotal >= r.minXP)?.key || "bronze";

      // Streak logic
      let newStreak = p.daily_streak || 0;
      const lastDate = p.last_workout_date;
      if (lastDate === today) {
        // Same day - don't change streak
        newStreak = p.daily_streak || 1;
      } else if (lastDate === yesterday) {
        newStreak = (p.daily_streak || 0) + 1;
      } else {
        newStreak = 1;
      }
      const newBest = Math.max(newStreak, p.longest_streak || 0);

      // Weekly goal logic
      const isNewWeek = p.last_reset_week !== currentWeekKey;
      const weeklyCompleted = isNewWeek ? 1 : (lastDate === today ? (p.weekly_completed || 0) : (p.weekly_completed || 0) + 1);

      await base44.entities.UserPoints.update(p.id, {
        total_points: newTotal,
        xp_current: newXP,
        rank: newRank,
        daily_streak: newStreak,
        longest_streak: newBest,
        last_workout_date: today,
        weekly_completed: weeklyCompleted,
        last_reset_week: currentWeekKey,
      });
    } else {
      await base44.entities.UserPoints.create({
        user_email: userEmail,
        total_points: xp,
        xp_current: xp,
        rank: "bronze",
        level: 1,
        daily_streak: 1,
        longest_streak: 1,
        last_workout_date: today,
        weekly_goal: 4,
        weekly_completed: 1,
        last_reset_week: currentWeekKey,
      });
    }

    queryClient.invalidateQueries(["customWorkouts"]);
    queryClient.invalidateQueries(["weekWorkouts"]);
    queryClient.invalidateQueries(["userPoints"]);

    setXpEarned(xp);
    setLoading(false);
    setShowXP(true);

    setTimeout(() => {
      setShowXP(false);
      onCompleted?.();
    }, 2500);
  };

  return (
    <div className="relative">
      <Button
        onClick={handleComplete}
        disabled={loading || showXP}
        className="w-full bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2] hover:from-[#CEEDB2] hover:to-[#CEF17B] text-[#084734] font-bold py-5"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registrando...</>
        ) : showXP ? (
          <><CheckCircle className="w-4 h-4 mr-2" /> Treino Concluído!</>
        ) : (
          <><CheckCircle className="w-4 h-4 mr-2" /> Concluir Treino</>
        )}
      </Button>

      <AnimatePresence>
        {showXP && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <div className="flex items-center gap-1 bg-[#CEF17B] text-[#084734] font-bold px-4 py-2 rounded-full shadow-lg">
              <Zap className="w-4 h-4" />
              +{xpEarned} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}