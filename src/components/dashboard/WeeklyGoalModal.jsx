import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Target } from "lucide-react";
import { motion } from "framer-motion";

export default function WeeklyGoalModal({ currentGoal, onSave, onClose }) {
  const [goal, setGoal] = useState(currentGoal || 4);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }}
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ backgroundColor: "#162A28", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#CEF17B]" />
            <h3 className="text-white font-bold text-lg">Meta Semanal</h3>
          </div>
          <button onClick={onClose} className="text-[#A0B5B2] text-2xl leading-none">×</button>
        </div>

        <p className="text-[#A0B5B2] text-sm mb-5">Quantos treinos você quer fazer por semana?</p>

        <div className="flex justify-center gap-3 mb-6">
          {[2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => setGoal(n)}
              className={`w-14 h-14 rounded-2xl font-black text-lg transition-all ${
                goal === n
                  ? "bg-[#CEF17B] text-[#084734] scale-110"
                  : "bg-white/10 text-[#CEEDB2] hover:bg-white/20"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onSave(goal)}
            className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#b8e05a] font-bold h-12"
          >
            Salvar
          </Button>
          <Button onClick={onClose} variant="outline" className="border-white/20 text-white h-12">
            Cancelar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}