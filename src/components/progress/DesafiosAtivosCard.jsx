import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";

function overallPercent(challenge) {
  const current = challenge.progress_current || 0;
  const total = challenge.progress_total || challenge.duration_days || 1;
  return Math.min(100, Math.round((current / total) * 100));
}

function isChallengeCompleted(challenge) {
  const current = challenge.progress_current || 0;
  const total = challenge.progress_total || challenge.duration_days || 1;
  return challenge.status === "completed" || current >= total;
}

function motivationalLabel(challenge) {
  if (isChallengeCompleted(challenge)) return "Desafio concluído!";
  if (challenge.completedToday) return "Meta do dia concluída!";
  if (overallPercent(challenge) >= 75) return "Quase lá, continue firme!";
  if (overallPercent(challenge) >= 50) return "Você está na metade!";
  if (overallPercent(challenge) >= 25) return "Bom começo!";
  return "Registre o progresso de hoje";
}

function ChallengeActiveItem({ challenge, onCompleteToday, isSaving }) {
  const current = challenge.progress_current || 0;
  const total = challenge.progress_total || challenge.duration_days || 1;
  const finished = isChallengeCompleted(challenge);
  const doneToday = !!challenge.completedToday;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: "rgba(206,241,123,0.15)" }}
          >
            <Sparkles className="h-5 w-5 text-[#CEF17B]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{challenge.title}</p>
            <p className="mt-0.5 text-xs text-white/45">
              <span className="font-semibold text-[#CEF17B]">{current}</span>
              <span> / {total} dias</span>
              <span className="text-white/25"> • </span>
              <span className="text-[#CEF17B]">+{challenge.xp_per_day || 10} XP/dia</span>
            </p>
          </div>
        </div>
        {(challenge.streakCount || 0) > 0 && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold text-white/70">
            <Flame className="h-3 w-3 text-orange-400" />
            {challenge.streakCount}
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">{motivationalLabel(challenge)}</span>
          <span
            className="text-xs font-bold"
            style={{ color: doneToday || finished ? "#4ade80" : "#CEF17B" }}
          >
            {overallPercent(challenge)}%
          </span>
        </div>
        <Progress
          value={overallPercent(challenge)}
          className="h-2.5 bg-white/10 [&>div]:bg-[#CEF17B]"
        />
      </div>

      <div className="px-4 pb-3">
        <div
          className="rounded-2xl px-4 py-3"
          style={{
            background: "rgba(206,241,123,0.07)",
            border: "1px solid rgba(206,241,123,0.12)",
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/50">Progresso de hoje</p>
            <p className="text-xs font-bold text-[#CEF17B]">{doneToday ? 1 : 0}/1</p>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full"
            style={{ background: "rgba(206,241,123,0.12)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background: doneToday
                  ? "linear-gradient(90deg,#4ade80,#22d3ee)"
                  : "linear-gradient(90deg,#CEF17B,#84cc16)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${doneToday ? 100 : 0}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          {doneToday && (
            <p className="mt-2 text-center text-[11px] font-semibold text-green-400">
              ✓ Meta do dia concluída!
            </p>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={() => onCompleteToday(challenge)}
          disabled={isSaving || challenge.completedToday || challenge.status === "completed"}
          className="w-full rounded-2xl py-3 text-xs font-bold transition-all active:scale-95 disabled:opacity-40"
          style={{
            background: doneToday || finished ? "rgba(255,255,255,0.08)" : "rgba(206,241,123,0.18)",
            border: "1px solid rgba(206,241,123,0.28)",
            color: doneToday || finished ? "rgba(255,255,255,0.5)" : "#CEF17B",
          }}
        >
          {challenge.completedToday
            ? "✔ Concluído hoje"
            : challenge.status === "completed"
              ? "Desafio concluído"
              : `Registrar hoje • +${challenge.xp_per_day || 10} XP`}
        </button>
        <p className="mt-2 text-center text-[11px] text-white/40">
          {challenge.description || "Registre o progresso diário para ganhar XP."}
        </p>
      </div>
    </div>
  );
}

export default function DesafiosAtivosCard({ challenges, onCompleteToday, isSaving }) {
  if (!challenges.length) {
    return (
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Desafios Ativos</p>
        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 text-center">
          <Target className="mx-auto h-8 w-8 text-white/25" />
          <p className="mt-3 text-sm font-bold text-white/70">Nenhum desafio ativo</p>
          <p className="mt-1 text-xs text-white/40">Explore abaixo e ative até 2 desafios.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Desafios Ativos</p>
      <div className="mt-4 space-y-4">
        {challenges.map((challenge) => (
          <ChallengeActiveItem
            key={challenge.id}
            challenge={challenge}
            onCompleteToday={onCompleteToday}
            isSaving={isSaving}
          />
        ))}
      </div>
    </Card>
  );
}
