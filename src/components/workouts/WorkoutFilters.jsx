import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WorkoutFilters({ 
  selectedCategory, 
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty
}) {
  const categories = [
    { value: "all", label: "Todos" },
    { value: "chest", label: "Peito" },
    { value: "back", label: "Costas" },
    { value: "legs", label: "Pernas" },
    { value: "shoulders", label: "Ombros" },
    { value: "arms", label: "Braços" },
    { value: "abs", label: "Abdômen" },
    { value: "cardio", label: "Cardio" },
    { value: "full_body", label: "Corpo Todo" },
  ];

  const difficulties = [
    { value: "all", label: "Todos Níveis" },
    { value: "beginner", label: "Iniciante" },
    { value: "intermediate", label: "Intermediário" },
    { value: "advanced", label: "Avançado" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Categoria</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              className={
                selectedCategory === cat.value
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-slate-800/50 border-white/10 hover:bg-slate-700/50"
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-300 mb-2">Dificuldade</p>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <Button
              key={diff.value}
              onClick={() => setSelectedDifficulty(diff.value)}
              variant={selectedDifficulty === diff.value ? "default" : "outline"}
              size="sm"
              className={
                selectedDifficulty === diff.value
                  ? "bg-pink-600 hover:bg-pink-700"
                  : "bg-slate-800/50 border-white/10 hover:bg-slate-700/50"
              }
            >
              {diff.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}