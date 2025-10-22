import React from "react";
import { Card } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";

export default function NutritionResults({ data }) {
  const macros = [
    { 
      label: "Calorias", 
      value: Math.round(data.calories), 
      unit: "kcal",
      icon: Flame,
      color: "from-orange-500 to-red-500"
    },
    { 
      label: "Proteína", 
      value: Math.round(data.protein), 
      unit: "g",
      icon: Beef,
      color: "from-green-500 to-emerald-500"
    },
    { 
      label: "Carboidratos", 
      value: Math.round(data.carbs), 
      unit: "g",
      icon: Wheat,
      color: "from-yellow-500 to-orange-500"
    },
    { 
      label: "Gorduras", 
      value: Math.round(data.fats), 
      unit: "g",
      icon: Droplet,
      color: "from-blue-500 to-cyan-500"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center py-3">
        <h3 className="text-2xl font-bold text-white">{data.food_name}</h3>
        <p className="text-sm text-gray-400 mt-1">Porção: {data.portion_size}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {macros.map((macro) => {
          const Icon = macro.icon;
          return (
            <Card 
              key={macro.label}
              className="bg-slate-800/50 backdrop-blur-xl border-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${macro.color} bg-opacity-20`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{macro.label}</p>
                  <p className="text-xl font-bold text-white">
                    {macro.value}
                    <span className="text-sm text-gray-400 ml-1">{macro.unit}</span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}