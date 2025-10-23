import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Beef, Wheat, Droplet } from "lucide-react";

export default function MacroProgress({ 
  protein, 
  carbs, 
  fats, 
  proteinTarget, 
  carbsTarget, 
  fatsTarget 
}) {
  const macros = [
    {
      name: "Proteína",
      value: Math.round(protein),
      target: proteinTarget || 150,
      icon: Beef,
      color: "#51CF66"
    },
    {
      name: "Carboidratos",
      value: Math.round(carbs),
      target: carbsTarget || 200,
      icon: Wheat,
      color: "#FFD43B"
    },
    {
      name: "Gorduras",
      value: Math.round(fats),
      target: fatsTarget || 60,
      icon: Droplet,
      color: "#4DABF7"
    }
  ];

  return (
    <Card className="glass-effect p-6">
      <h2 className="text-xl font-bold text-white mb-6">Macros de Hoje</h2>
      <div className="space-y-6">
        {macros.map((macro) => {
          const Icon = macro.icon;
          const progress = (macro.value / macro.target) * 100;
          
          return (
            <div key={macro.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${macro.color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: macro.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{macro.name}</p>
                    <p className="text-xs text-white/60">
                      {macro.value}g / {macro.target}g
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{Math.min(Math.round(progress), 100)}%</p>
                </div>
              </div>
              <Progress 
                value={Math.min(progress, 100)} 
                className="h-2 bg-white/20"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}