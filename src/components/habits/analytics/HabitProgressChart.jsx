import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function HabitProgressChart({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Consistency Curve</p>
          <h3 className="mt-2 text-lg font-bold text-white">Habit Progress Chart</h3>
          <p className="text-sm text-white/55">Acompanhe sua consistência diária ao longo do tempo.</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="habitAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF6A00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#FF6A00" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "#121918", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }}
                formatter={(value) => [`${value}%`, "Conclusão"]}
              />
              <Area type="monotone" dataKey="completion" stroke="#FF6A00" strokeWidth={3} fill="url(#habitAreaGradient)" animationDuration={700} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}