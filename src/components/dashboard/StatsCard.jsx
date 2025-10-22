import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function StatsCard({ title, value, target, icon: Icon, color, suffix }) {
  const progress = target ? (value / target) * 100 : 0;

  return (
    <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-4 hover:scale-105 transition-transform duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color} bg-opacity-20`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">
            {value}
            <span className="text-sm text-gray-400 ml-1">{suffix}</span>
          </div>
          {target > 0 && (
            <div className="text-xs text-gray-400">
              de {target}{suffix}
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-400">{title}</p>
        {target > 0 && (
          <Progress 
            value={Math.min(progress, 100)} 
            className="h-1.5 bg-slate-800"
          />
        )}
      </div>
    </Card>
  );
}