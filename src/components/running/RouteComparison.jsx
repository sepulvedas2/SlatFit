import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Zap, TrendingUp, TrendingDown, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function RouteComparison({ userEmail }) {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { data: savedRoutes = [] } = useQuery({
    queryKey: ['savedRoutes', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return db.SavedRoute.filter({ user_email: userEmail }, '-times_completed');
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const { data: routeActivities = [] } = useQuery({
    queryKey: ['routeActivities', selectedRoute?.id],
    queryFn: async () => {
      if (!selectedRoute) return [];
      const activities = await db.RunningActivity.filter({ user_email: userEmail });
      return activities.filter(a => selectedRoute.activity_ids?.includes(a.id));
    },
    enabled: !!selectedRoute,
    initialData: [],
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (savedRoutes.length === 0) {
    return (
      <Card className="glass-effect border-[#CEF17B]/20 p-8 text-center">
        <MapPin className="w-12 h-12 text-white/20 mx-auto mb-3" />
        <p className="text-white/60">Nenhuma rota salva ainda</p>
        <p className="text-white/40 text-xs mt-1">Complete corridas para salvar rotas favoritas</p>
      </Card>
    );
  }

  if (selectedRoute) {
    const sortedActivities = [...routeActivities].sort((a, b) => a.duration_seconds - b.duration_seconds);
    const bestActivity = sortedActivities[0];
    const worstActivity = sortedActivities[sortedActivities.length - 1];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedRoute(null)}
            className="glass-effect border-[#CEF17B]/20"
          >
            ← Voltar
          </Button>
          <div>
            <h3 className="font-bold text-white">{selectedRoute.route_name}</h3>
            <p className="text-xs text-[#CEEDB2]">{selectedRoute.distance_km.toFixed(1)} km • {selectedRoute.times_completed}x completada</p>
          </div>
        </div>

        <Card className="glass-effect border-[#CEF17B]/20 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-white/60 mb-1">Melhor Tempo</p>
              <p className="text-xl font-bold text-white">{formatTime(selectedRoute.best_time_seconds)}</p>
              <p className="text-xs text-green-400">{selectedRoute.best_pace}</p>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-[#CEF17B] mx-auto mb-1" />
              <p className="text-xs text-white/60 mb-1">Média Geral</p>
              <p className="text-xl font-bold text-white">
                {formatTime(
                  sortedActivities.reduce((sum, a) => sum + a.duration_seconds, 0) / sortedActivities.length
                )}
              </p>
            </div>
          </div>
        </Card>

        <div>
          <h4 className="font-bold text-white mb-3">Histórico de Tentativas</h4>
          <div className="space-y-2">
            {sortedActivities.map((activity, index) => {
              const isBest = activity.id === bestActivity.id;
              const isWorst = activity.id === worstActivity.id && sortedActivities.length > 1;
              
              return (
                <Card 
                  key={activity.id}
                  className={`p-3 ${
                    isBest ? 'bg-green-500/10 border-green-500/20' :
                    isWorst ? 'bg-red-500/10 border-red-500/20' :
                    'glass-effect border-[#CEF17B]/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-white/60 font-semibold">#{index + 1}</span>
                      <div>
                        <p className="text-sm text-white font-semibold">
                          {formatTime(activity.duration_seconds)}
                        </p>
                        <p className="text-xs text-white/60">
                          {new Date(activity.activity_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/10 text-white border-0 text-xs">
                        {activity.pace_avg}
                      </Badge>
                      {isBest && (
                        <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          Recorde
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-white">Rotas Favoritas</h2>
      
      {savedRoutes.map((route, index) => (
        <motion.div
          key={route.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            onClick={() => setSelectedRoute(route)}
            className="glass-effect border-[#CEF17B]/20 p-4 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#CEF17B]" />
                  <h3 className="font-bold text-white">{route.route_name}</h3>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-white/70 mb-3">
                  <span>{route.distance_km.toFixed(1)} km</span>
                  <span>•</span>
                  <span>{route.times_completed}x completada</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-xs text-white/60">Recorde</p>
                    <p className="text-sm font-bold text-white">{formatTime(route.best_time_seconds)}</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded">
                    <p className="text-xs text-white/60">Melhor Pace</p>
                    <p className="text-sm font-bold text-white">{route.best_pace}</p>
                  </div>
                </div>
              </div>

              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}