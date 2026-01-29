import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, MapPin, Timer, Zap } from "lucide-react";

export default function RunningStats({ activities = [] }) {
  const totalDistance = activities.reduce((sum, act) => sum + (act.distance_km || 0), 0);
  const totalDuration = activities.reduce((sum, act) => sum + (act.duration_seconds || 0), 0);
  const totalCalories = activities.reduce((sum, act) => sum + (act.calories_burned || 0), 0);
  const avgPace = activities.length > 0 
    ? (totalDuration / 60 / totalDistance).toFixed(2) 
    : 0;

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="glass-effect p-4 border-[#CEF17B]/20">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[#CEF17B]" />
          <div>
            <p className="text-xs text-white/60">Total</p>
            <p className="text-xl font-bold text-white">{totalDistance.toFixed(1)} km</p>
          </div>
        </div>
      </Card>

      <Card className="glass-effect p-4 border-[#CEF17B]/20">
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-[#CEF17B]" />
          <div>
            <p className="text-xs text-white/60">Tempo</p>
            <p className="text-xl font-bold text-white">
              {Math.floor(totalDuration / 3600)}h {Math.floor((totalDuration % 3600) / 60)}min
            </p>
          </div>
        </div>
      </Card>

      <Card className="glass-effect p-4 border-[#CEF17B]/20">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#CEF17B]" />
          <div>
            <p className="text-xs text-white/60">Pace Médio</p>
            <p className="text-xl font-bold text-white">{avgPace} min/km</p>
          </div>
        </div>
      </Card>

      <Card className="glass-effect p-4 border-[#CEF17B]/20">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
          <div>
            <p className="text-xs text-white/60">Calorias</p>
            <p className="text-xl font-bold text-white">{totalCalories} kcal</p>
          </div>
        </div>
      </Card>
    </div>
  );
}