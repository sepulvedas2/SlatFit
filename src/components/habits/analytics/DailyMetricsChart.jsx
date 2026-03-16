import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DailyMetricsChart({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="rounded-3xl border-white/10 bg-[#101716] p-5 shadow-2xl shadow-black/20">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Daily Metrics</p>
          <h3 className="mt-2 text-lg font-bold text-white">Energia, foco, humor e sono</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#121918", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="energy" stroke="#FF6A00" strokeWidth={2.5} dot={false} animationDuration={700} />
              <Line type="monotone" dataKey="focus" stroke="#CEF17B" strokeWidth={2.5} dot={false} animationDuration={850} />
              <Line type="monotone" dataKey="mood" stroke="#60A5FA" strokeWidth={2.5} dot={false} animationDuration={1000} />
              <Line type="monotone" dataKey="sleep" stroke="#C084FC" strokeWidth={2.5} dot={false} animationDuration={1150} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}