import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Dumbbell, CheckCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroAction({ nextWorkout, allDone }) {
  if (allDone) {
    return (
      <div className="space-y-3">
        <div className="px-1">
          <p className="text-[#CEEDB2] text-sm">Semana atual</p>
          <p className="text-white text-xl font-bold mt-0.5">🎉 Todos os treinos concluídos!</p>
        </div>
        <Link to={createPageUrl("Workouts")} className="block">
          <Button className="w-full h-14 text-base font-bold rounded-2xl bg-green-500/20 border border-green-500/40 text-green-400 cursor-default" disabled>
            <PartyPopper className="w-5 h-5 mr-2" />
            Semana Completa — Parabéns!
          </Button>
        </Link>
      </div>
    );
  }

  if (!nextWorkout) {
    return (
      <div className="space-y-3">
        <div className="px-1">
          <p className="text-[#CEEDB2] text-sm">Seu próximo treino</p>
          <p className="text-white text-xl font-bold mt-0.5">💪 Pronto para treinar?</p>
        </div>
        <Link to={createPageUrl("Workouts")} className="block">
          <Button className="w-full h-16 text-lg font-black rounded-2xl shadow-lg bg-[#CEF17B] hover:bg-[#b8d966] text-[#084734] hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Dumbbell className="w-6 h-6 mr-2" />
            Ver Planilhas de Treino
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="px-1">
        <p className="text-[#CEEDB2] text-sm">Seu próximo treino</p>
        <p className="text-white text-xl font-bold mt-0.5">
          💪 {nextWorkout.muscle}
        </p>
        <p className="text-[#CEEDB2] text-xs mt-0.5">{nextWorkout.dayLabel} · {nextWorkout.planTitle}</p>
      </div>
      <Link to={createPageUrl("Workouts")} className="block">
        <Button className="w-full h-16 text-lg font-black rounded-2xl shadow-lg bg-[#CEF17B] hover:bg-[#b8d966] text-[#084734] hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Dumbbell className="w-6 h-6 mr-2" />
          Iniciar Treino
        </Button>
      </Link>
    </div>
  );
}