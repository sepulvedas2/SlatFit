import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, TrendingUp, MapPin, Timer, Zap, Trophy,
  ChevronRight, Bike, Footprints, Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import RunningTracker from "../components/running/RunningTracker";
import RunningHistory from "../components/running/RunningHistory";
import RunningStats from "../components/running/RunningStats";

export default function Running() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("home"); // home, tracking, history

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: recentActivities = [] } = useQuery({
    queryKey: ['runningActivities', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const activities = await base44.entities.RunningActivity.filter({ 
        user_email: user.email 
      }, '-activity_date', 10);
      return activities;
    },
    enabled: !!user?.email,
    initialData: [],
  });

  const totalDistance = recentActivities.reduce((sum, act) => sum + (act.distance_km || 0), 0);
  const totalActivities = recentActivities.length;

  if (activeView === "tracking") {
    return <RunningTracker onFinish={() => setActiveView("home")} userEmail={user?.email} />;
  }

  if (activeView === "history") {
    return <RunningHistory userEmail={user?.email} onBack={() => setActiveView("home")} />;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Corrida & Performance</h1>
          <p className="text-[#CEEDB2]">Monitore suas atividades outdoor em tempo real</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-effect p-4 border-[#CEF17B]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#CEF17B]" />
              </div>
              <div>
                <p className="text-xs text-white/60">Total</p>
                <p className="text-xl font-bold text-white">{totalDistance.toFixed(1)} km</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-4 border-[#CEF17B]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#CEF17B]" />
              </div>
              <div>
                <p className="text-xs text-white/60">Atividades</p>
                <p className="text-xl font-bold text-white">{totalActivities}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Start Activity Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Corrida */}
          <Card 
            onClick={() => setActiveView("tracking")}
            className="glass-effect p-6 border-[#CEF17B]/20 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Footprints className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Iniciar Corrida</h3>
                <p className="text-sm text-[#CEEDB2]">Monitore em tempo real</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#CEF17B]" />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500/20 text-orange-400 border-0 text-xs">
                GPS
              </Badge>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                Pace ao vivo
              </Badge>
            </div>
          </Card>

          {/* Ciclismo */}
          <Card 
            onClick={() => setActiveView("tracking")}
            className="glass-effect p-6 border-[#CEF17B]/20 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Bike className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Iniciar Pedalada</h3>
                <p className="text-sm text-[#CEEDB2]">Track de ciclismo</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#CEF17B]" />
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-400 border-0 text-xs">
                GPS
              </Badge>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 text-xs">
                Velocidade
              </Badge>
            </div>
          </Card>
        </div>

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Atividades Recentes</h3>
              <Button
                onClick={() => setActiveView("history")}
                variant="ghost"
                size="sm"
                className="text-[#CEF17B]"
              >
                Ver todas
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {recentActivities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-white/5 rounded-lg"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.activity_type === 'corrida' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                  }`}>
                    {activity.activity_type === 'corrida' ? (
                      <Footprints className="w-5 h-5 text-orange-400" />
                    ) : (
                      <Bike className="w-5 h-5 text-blue-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-white capitalize">{activity.activity_type}</p>
                    <p className="text-xs text-[#CEEDB2]">
                      {new Date(activity.activity_date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-white">{activity.distance_km.toFixed(2)} km</p>
                    <p className="text-xs text-[#CEEDB2]">{activity.pace_avg || '--'}</p>
                  </div>

                  {activity.is_personal_record && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                      <Trophy className="w-3 h-3 mr-1" />
                      PR
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Info Cards */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <h3 className="font-bold text-white mb-3">💡 Como funciona</h3>
          <div className="space-y-2 text-sm text-[#CEEDB2]">
            <p>• GPS em tempo real durante toda a atividade</p>
            <p>• Pace dinâmico calculado automaticamente</p>
            <p>• Feedback motivacional durante o treino</p>
            <p>• Histórico completo e gráficos de evolução</p>
            <p>• Recordes pessoais destacados</p>
          </div>
        </Card>

      </div>
    </div>
  );
}