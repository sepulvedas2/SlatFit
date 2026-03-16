import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function ScoreDisciplinaCard({ score, level, description }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Pontuação Central</p>
            <h3 className="mt-2 text-xl font-bold text-white">Pontuação de Disciplina</h3>
            <p className="mt-2 max-w-xs text-sm text-white/55">{description}</p>
            <div className="mt-4 inline-flex rounded-2xl border border-[#CEF17B]/15 bg-black/10 px-3 py-2 text-sm font-semibold text-[#CEF17B]">
              {level}
            </div>
          </div>

          <div className="relative h-32 w-32 shrink-0">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
              <circle
                cx="70"
                cy="70"
                r={radius}
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                fill="none"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#CEF17B" />
                  <stop offset="100%" stopColor="#FF6A00" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{score}</span>
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">de 100</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}