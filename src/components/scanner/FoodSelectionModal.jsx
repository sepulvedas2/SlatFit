import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MealTypeSelector from "./MealTypeSelector";

export default function FoodSelectionModal({ food, open, onClose, onAdd }) {
  const [quantity, setQuantity] = useState("1");
  const [mealType, setMealType] = useState("lunch");

  const multiplier = Math.max(parseFloat(quantity) || 1, 0.1);
  const nutrition = useMemo(() => ({
    calories: Math.round((food?.calories || 0) * multiplier),
    protein: Math.round(((food?.protein || 0) * multiplier) * 10) / 10,
    carbohydrates: Math.round(((food?.carbohydrates || 0) * multiplier) * 10) / 10,
    fat: Math.round(((food?.fat || 0) * multiplier) * 10) / 10,
  }), [food, multiplier]);

  if (!open || !food) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="w-full max-w-lg rounded-t-3xl p-5 space-y-4"
          style={{ background: "#0A2A20", border: "1px solid rgba(206,241,123,0.15)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-lg">{food.food_name}</h3>
              <p className="text-white/45 text-sm">Porção padrão: {food.portion_size}</p>
            </div>
            <button onClick={onClose} className="text-white/40 text-2xl leading-none">×</button>
          </div>

          <MealTypeSelector selected={mealType} onChange={setMealType} />

          <div>
            <Label className="text-white/60 text-sm">Quantidade</Label>
            <Input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-white/5 border-white/10 text-white mt-1 h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Calorias', value: `${nutrition.calories} kcal` },
              { label: 'Proteínas', value: `${nutrition.protein} g` },
              { label: 'Carboidratos', value: `${nutrition.carbohydrates} g` },
              { label: 'Gorduras', value: `${nutrition.fat} g` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-white/45 text-xs">{item.label}</p>
                <p className="text-white font-bold text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={() => onAdd({ food, quantity: multiplier, mealType, nutrition })}
            className="w-full h-14 rounded-2xl font-bold text-[#084734]"
            style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
          >
            Adicionar à refeição
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}