import React from "react";
import { Card } from "@/components/ui/card";

export default function UserResumoCard({ xp, level, ranking, streak }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Resumo do Usuário</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/40">XP total</p><p className="mt-2 text-2xl font-black text-[#CEF17B]">{xp}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/40">Nível atual</p><p className="mt-2 text-2xl font-black text-white">{level}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/40">Ranking</p><p className="mt-2 text-2xl font-black text-white">{ranking ? `#${ranking}` : '—'}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/40">Streak</p><p className="mt-2 text-2xl font-black text-white">🔥 {streak}</p></div>
      </div>
    </Card>
  );
}