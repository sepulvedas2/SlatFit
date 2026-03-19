import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function DesafiosAtivosCard({ challenges, onCompleteToday, isSaving }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Desafios Ativos</p>
      <div className="mt-4 space-y-3">
        {challenges.map((challenge) => (
          <div key={challenge.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{challenge.title}</p>
                  {challenge.completedToday && <span className="rounded-full bg-[#CEF17B]/15 px-2 py-1 text-[10px] font-bold text-[#CEF17B]">CONCLUÍDO</span>}
                </div>
                <p className="mt-1 text-xs text-white/50">{challenge.description}</p>
                <p className="mt-2 text-xs text-[#CEF17B]">{challenge.progressText} • 🔥 {challenge.streakCount || 0}</p>
              </div>
              <Button onClick={() => onCompleteToday(challenge)} disabled={isSaving || challenge.completedToday || challenge.status === 'completed'} className="h-10 rounded-2xl bg-[#CEF17B] px-4 text-xs font-bold text-[#0B3936] hover:bg-[#bfe56b] disabled:bg-white/10 disabled:text-white/50">
                {challenge.completedToday ? '✔ Concluído hoje' : challenge.status === 'completed' ? 'Concluído' : 'Concluir hoje'}
              </Button>
            </div>
            <Progress value={challenge.progressPercent} className="mt-3 h-2 bg-white/10 [&>div]:bg-[#CEF17B]" />
          </div>
        ))}
      </div>
    </Card>
  );
}