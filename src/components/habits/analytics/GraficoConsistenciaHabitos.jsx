import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function GraficoConsistenciaHabitos({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Consistência</p>
          <h3 className="mt-2 text-xl font-bold text-white">Progresso de Hábitos</h3>
          <p className="text-sm text-white/55">Percentual diário de hábitos concluídos ao longo do tempo.</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="habitConsistencyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "#12201d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }}
                formatter={(value) => [`${value}%`, "Conclusão"]}
              />
              <Area type="monotone" dataKey="completion" stroke="#FF6A00" strokeWidth={3} fill="url(#habitConsistencyGradient)" animationDuration={700} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}