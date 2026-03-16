import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function GraficoMetricasDiarias({ data }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Tendências Pessoais</p>
          <h3 className="mt-2 text-xl font-bold text-white">Energia, foco, humor e sono</h3>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#12201d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="energia" stroke="#FF6A00" strokeWidth={2.5} dot={false} animationDuration={700} />
              <Line type="monotone" dataKey="foco" stroke="#CEF17B" strokeWidth={2.5} dot={false} animationDuration={850} />
              <Line type="monotone" dataKey="humor" stroke="#60A5FA" strokeWidth={2.5} dot={false} animationDuration={1000} />
              <Line type="monotone" dataKey="sono" stroke="#C084FC" strokeWidth={2.5} dot={false} animationDuration={1150} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
}