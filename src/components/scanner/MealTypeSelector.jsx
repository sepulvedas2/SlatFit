import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Sun, Sunset, Moon } from "lucide-react";

export default function MealTypeSelector({ selected, onChange }) {
  const mealTypes = [
    { value: "breakfast", label: "Café", icon: Coffee },
    { value: "lunch", label: "Almoço", icon: Sun },
    { value: "dinner", label: "Jantar", icon: Sunset },
    { value: "snack", label: "Lanche", icon: Moon },
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-300">Tipo de Refeição</p>
      <div className="grid grid-cols-4 gap-2">
        {mealTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selected === type.value;
          return (
            <Button
              key={type.value}
              onClick={() => onChange(type.value)}
              variant={isSelected ? "default" : "outline"}
              className={`flex-col h-auto py-3 ${
                isSelected 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "bg-slate-800/50 border-white/10"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{type.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}