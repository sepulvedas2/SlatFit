import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HabitOverallProgress({ data, weeklyProgress, disciplinePoints, completedCount, expectedCount }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Disciplina visual</p>
        <h2 className="mt-2 text-xl font-bold text-white">Progresso Geral dos Hábitos</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Pontuação de disciplina</p>
          <p className="mt-2 text-2xl font-black text-[#CEF17B]">{disciplinePoints}</p>
          <p className="mt-1 text-xs text-white/45">+10 por hábito concluído</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Hábitos concluídos</p>
          <p className="mt-2 text-2xl font-black text-white">{completedCount}</p>
          <p className="mt-1 text-xs text-white/45">de {expectedCount} esperados</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-white/40">Progresso semanal</p>
          <p className="mt-2 text-2xl font-black text-white">{weeklyProgress}%</p>
          <p className="mt-1 text-xs text-white/45">consistência da semana</p>
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              contentStyle={{ background: "#12201d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }}
              formatter={(value) => [`${value}%`, "Disciplina"]}
            />
            <Line type="monotone" dataKey="progress" stroke="#CEF17B" strokeWidth={3} dot={{ r: 3, fill: "#CEF17B" }} activeDot={{ r: 5 }} animationDuration={700} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/65">Barra de progresso semanal</span>
          <span className="font-semibold text-[#CEF17B]">{weeklyProgress}%</span>
        </div>
        <Progress value={weeklyProgress} className="h-3 bg-white/10 [&>div]:bg-[#CEF17B]" />
      </div>
    </Card>
  );
}