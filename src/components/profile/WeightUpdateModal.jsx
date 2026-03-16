import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function WeightUpdateModal({ open, onClose, onSave, saving, defaultCurrentWeight, defaultGoalWeight }) {
  const [weightCurrent, setWeightCurrent] = useState(defaultCurrentWeight || "");
  const [weightGoal, setWeightGoal] = useState(defaultGoalWeight || "");

  useEffect(() => {
    setWeightCurrent(defaultCurrentWeight || "");
    setWeightGoal(defaultGoalWeight || "");
  }, [defaultCurrentWeight, defaultGoalWeight, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        className="w-full max-w-lg rounded-t-3xl p-6"
        style={{ backgroundColor: "#162A28", border: "1px solid rgba(206,241,123,0.2)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">Atualizar peso</h3>
          <button onClick={onClose} className="text-[#A0B5B2] text-2xl leading-none">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-[#A0B5B2] text-xs">Peso atual (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={weightCurrent}
              onChange={(e) => setWeightCurrent(e.target.value)}
              className="bg-white/10 border-white/10 text-white mt-1"
            />
          </div>

          <div>
            <Label className="text-[#A0B5B2] text-xs">Peso objetivo (kg)</Label>
            <Input
              type="number"
              step="0.1"
              value={weightGoal}
              onChange={(e) => setWeightGoal(e.target.value)}
              className="bg-white/10 border-white/10 text-white mt-1"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onSave({ weightCurrent: parseFloat(weightCurrent), weightGoal: parseFloat(weightGoal) })}
              disabled={saving || !weightCurrent || !weightGoal}
              className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#b8e05a] font-bold h-12"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button onClick={onClose} variant="outline" className="border-white/20 text-white h-12">
              Cancelar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}