import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function WeeklyPerformanceChart({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Weekly Performance</p>
          <h3 className="mt-2 text-lg font-bold text-white">Performance por dia da semana</h3>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "#121918", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }}
                formatter={(value) => [`${value}%`, "Performance"]}
              />
              <Bar dataKey="completion" radius={[10, 10, 0, 0]} animationDuration={700}>
                {data.map((entry) => (
                  <Cell key={entry.label} fill={entry.completion >= 80 ? "#CEF17B" : entry.completion >= 50 ? "#FFB86B" : "#2A3433"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}