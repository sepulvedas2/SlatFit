import React from "react";
import { Button } from "@/components/ui/button";
import { Coffee, Sun, Sunset, Moon } from "lucide-react";

export default function MealFilters({ selected, onChange }) {
  const filters = [
    { value: "all", label: "Todas", icon: null },
    { value: "breakfast", label: "Café", icon: Coffee },
    { value: "lunch", label: "Almoço", icon: Sun },
    { value: "dinner", label: "Jantar", icon: Sunset },
    { value: "snack", label: "Lanche", icon: Moon },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        return (
          <Button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            variant={selected === filter.value ? "default" : "outline"}
            className={
              selected === filter.value
                ? "bg-orange-600 hover:bg-orange-700"
                : "bg-slate-800/50 border-white/10 hover:bg-slate-700/50"
            }
          >
            {Icon && <Icon className="w-4 h-4 mr-2" />}
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}