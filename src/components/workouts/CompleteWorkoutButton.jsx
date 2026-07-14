import React, { useState } from "react";
import { api } from "@/api/client";
import { db } from "@/components/supabaseApi";
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

export default function CompleteWorkoutButton({ workout, exercises, userId, onCompleted }) {
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const queryClient = useQueryClient();

  const handleComplete = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const intensity = extractIntensity(workout.observacoes);
      const xp = XP_BY_INTENSITY[intensity];
      const today = new Date().toISOString().split("T")[0];

      await db.WorkoutLog.create({
        user_id: userId,
        workout_id: workout.id,
        workout_name: workout.nome_treino,
        completed_date: today,
        duration_minutes: 55,
        calories_burned: intensity === "intenso" ? 400 : intensity === "moderado" ? 280 : 180,
      });

      const { data } = await api.functions.invoke("addXP", {
        amount: xp,
        source: "workout",
        reference_id: workout.id,
      });
      if (data?.error) {
        throw new Error(data.error);
      }

      queryClient.invalidateQueries({ queryKey: ["customWorkouts"] });
      queryClient.invalidateQueries({ queryKey: ["weekWorkouts"] });
      queryClient.invalidateQueries({ queryKey: ["userPoints"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });

      setXpEarned(xp);
      setShowXP(true);

      setTimeout(() => {
        setShowXP(false);
        onCompleted?.();
      }, 2500);
    } catch (error) {
      console.error("[CompleteWorkoutButton] Erro:", error);
      alert(error?.message || "Erro ao concluir treino.");
    } finally {
      setLoading(false);
    }
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
