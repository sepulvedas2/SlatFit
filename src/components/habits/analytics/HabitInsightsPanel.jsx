import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function HabitInsightsPanel({ insights }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Insights</p>
          <h3 className="mt-2 text-lg font-bold text-white">Leituras automáticas</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight) => (
            <div key={insight.title} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">{insight.title}</p>
              <p className="mt-2 text-sm font-semibold text-white">{insight.value}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{insight.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}