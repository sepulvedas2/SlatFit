import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Footprints, Bike, MapPin, Timer, Zap, ChevronDown, ChevronUp } from "lucide-react";
import SplitsDetail from "./SplitsDetail";

export default function RunningHistory({ userEmail, onBack }) {
  const [expandedActivity, setExpandedActivity] = useState(null);

  const { data: activities = [] } = useQuery({
    queryKey: ['runningActivities', userEmail],
    queryFn: async () => {
      if (!userEmail) return [];
      return base44.entities.RunningActivity.filter({ 
        user_email: userEmail 
      }, '-activity_date');
    },
    enabled: !!userEmail,
    initialData: [],
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}min`;
    return `${mins}min ${secs}s`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="glass-effect border-[#CEF17B]/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Histórico de Atividades</h1>
            <p className="text-[#CEEDB2]">{activities.length} atividades registradas</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <Card className="glass-effect p-12 border-[#CEF17B]/20 text-center">
            <p className="text-white/60">Nenhuma atividade registrada ainda</p>
            <p className="text-sm text-[#CEEDB2] mt-2">Inicie sua primeira corrida ou pedalada!</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="glass-effect p-6 border-[#CEF17B]/20">
                <div className="flex items-start gap-4">
                  
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.activity_type === 'corrida' ? 'bg-orange-500/20' : 'bg-blue-500/20'
                  }`}>
                    {activity.activity_type === 'corrida' ? (
                      <Footprints className="w-6 h-6 text-orange-400" />
                    ) : (
                      <Bike className="w-6 h-6 text-blue-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-white capitalize">{activity.activity_type}</h3>
                      {activity.is_personal_record && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-0">
                          <Trophy className="w-3 h-3 mr-1" />
                          PR
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#CEEDB2]">
                      {new Date(activity.activity_date).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Distância</p>
                        <p className="font-bold text-white">{activity.distance_km.toFixed(2)} km</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Tempo</p>
                        <p className="font-bold text-white">{formatTime(activity.duration_seconds)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Pace</p>
                        <p className="font-bold text-white">{activity.pace_avg}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/60 mb-1">Calorias</p>
                        <p className="font-bold text-white">{activity.calories_burned} kcal</p>
                      </div>
                    </div>

                    {activity.notes && (
                      <p className="text-sm text-[#CEEDB2] mt-3 italic">"{activity.notes}"</p>
                    )}

                    {/* Toggle Splits */}
                    {activity.route_data && activity.route_data.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedActivity(expandedActivity === activity.id ? null : activity.id);
                        }}
                        className="w-full mt-3 text-[#CEF17B] hover:bg-[#CEF17B]/10"
                      >
                        {expandedActivity === activity.id ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Ocultar Splits
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Ver Splits por KM
                          </>
                        )}
                      </Button>
                    )}

                    {/* Expanded Splits */}
                    {expandedActivity === activity.id && (
                      <div className="mt-3">
                        <SplitsDetail activity={activity} />
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}