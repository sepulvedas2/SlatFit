import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DesafioDoDiaCard({ challenge, onComplete, isSaving }) {
  if (!challenge) return null;

  return (
    <Card className="rounded-3xl border-[#CEF17B]/20 bg-[#CEF17B]/10 p-5 shadow-xl shadow-[#CEF17B]/10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#CEF17B]/70">Desafio do Dia</p>
      <h2 className="mt-2 text-xl font-black text-white">{challenge.title}</h2>
      <p className="mt-2 text-sm text-white/65">{challenge.description}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-[#CEF17B]">
        <span>{challenge.duration_days} dias</span>
        <span>•</span>
        <span>{challenge.xp_per_day} XP/dia</span>
        <span>•</span>
        <span>{challenge.difficulty}</span>
      </div>
      {challenge.completedToday && <div className="mt-4 rounded-2xl bg-[#CEF17B]/15 px-3 py-2 text-center text-xs font-bold text-[#CEF17B]">CONCLUÍDO HOJE</div>}
      <Button onClick={() => onComplete(challenge)} disabled={isSaving || challenge.completedToday} className="mt-4 h-12 w-full rounded-2xl bg-[#CEF17B] font-bold text-[#0B3936] hover:bg-[#bfe56b] disabled:bg-white/10 disabled:text-white/50">
        {challenge.completedToday ? '✔ Concluído hoje' : '✔ Concluir hoje'}
      </Button>
    </Card>
  );
}