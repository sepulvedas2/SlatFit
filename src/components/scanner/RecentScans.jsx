import React from "react";
import { Card } from "@/components/ui/card";
import { Clock, Flame } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentScans({ recentFoods }) {
  if (!recentFoods || recentFoods.length === 0) return null;

  const displayFoods = recentFoods.slice(0, 3);

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#CEF17B]" />
        <h3 className="font-bold text-white text-sm">Últimos Escaneamentos</h3>
      </div>

      <div className="space-y-2">
        {displayFoods.map((food, index) => {
          const timeAgo = food.created_date 
            ? format(new Date(food.created_date), "HH:mm", { locale: ptBR })
            : "Agora";

          return (
            <div 
              key={index}
              className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
            >
              {food.image_url ? (
                <img 
                  src={food.image_url} 
                  alt={food.food_name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">
                  {food.food_name}
                </p>
                <p className="text-xs text-white/60">
                  {timeAgo} • {Math.round(food.calories)} kcal
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}