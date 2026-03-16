import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const metricLabels = [
  { key: "energia", label: "Energia" },
  { key: "foco", label: "Foco" },
  { key: "humor", label: "Humor" },
  { key: "sono", label: "Sono" },
];

export default function FormMetricasDiarias({ values, onChange, onSave, isSaving }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Registro Diário</p>
          <h3 className="mt-2 text-xl font-bold text-white">Métricas Diárias</h3>
          <p className="text-sm text-white/55">Registre como você está hoje para alimentar suas análises automáticas.</p>
        </div>

        <div className="space-y-4">
          {metricLabels.map((metric) => (
            <div key={metric.key}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-white">{metric.label}</span>
                <span className="text-xs text-white/45">{values[metric.key] || 0}/5</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => onChange(metric.key, value)}
                    className={`h-11 rounded-2xl border text-sm font-bold transition-all ${values[metric.key] === value ? "border-[#CEF17B]/35 bg-[#CEF17B]/12 text-[#CEF17B]" : "border-white/8 bg-white/[0.03] text-white/65"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={onSave} disabled={isSaving} className="mt-5 h-12 w-full rounded-2xl bg-[#CEF17B] font-bold text-[#0B3936] hover:bg-[#bfe56b]">
          {isSaving ? "Salvando..." : "Salvar métricas de hoje"}
        </Button>
      </Card>
    </motion.div>
  );
}