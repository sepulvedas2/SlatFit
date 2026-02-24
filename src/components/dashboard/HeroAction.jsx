import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dumbbell, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAY_WORKOUTS = {
  1: "Peito / Tríceps",
  2: "Costas / Bíceps",
  3: "Pernas",
  4: "Peito / Tríceps",
  5: "Costas / Bíceps",
  6: "Ombro / Abdômen",
  0: "Descanso 😴",
};

export default function HeroAction({ todayWorkouts = [] }) {
  const dayOfWeek = new Date().getDay();
  const todayFocus = DAY_WORKOUTS[dayOfWeek] || "Treino Livre";
  const workoutDone = todayWorkouts.length > 0;

  return (
    <div className="space-y-3">
      {/* Foco do dia */}
      <div className="px-1">
        <p className="text-[#CEEDB2] text-sm">Foco de hoje</p>
        <p className="text-white text-xl font-bold mt-0.5">
          {dayOfWeek === 0 ? "🛌 Dia de descanso" : `💪 ${todayFocus}`}
        </p>
      </div>

      {/* CTA Principal */}
      {dayOfWeek !== 0 && (
        <Link to={createPageUrl("Workouts")} className="block">
          <Button
            className={`w-full h-16 text-lg font-black rounded-2xl shadow-lg transition-all ${
              workoutDone
                ? "bg-green-500/20 border border-green-500/40 text-green-400 cursor-default"
                : "bg-[#CEF17B] hover:bg-[#b8d966] text-[#084734] hover:scale-[1.02] active:scale-[0.98]"
            }`}
            disabled={workoutDone}
          >
            {workoutDone ? (
              <>
                <CheckCircle className="w-6 h-6 mr-2" />
                Treino Concluído ✓
              </>
            ) : (
              <>
                <Dumbbell className="w-6 h-6 mr-2" />
                Iniciar Treino
              </>
            )}
          </Button>
        </Link>
      )}
    </div>
  );
}