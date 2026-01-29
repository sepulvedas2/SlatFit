import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footprints, Bike, Clock, Zap, MapPin, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ActivityFeed({ userCity, limit = 20 }) {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activityFeed', userCity],
    queryFn: async () => {
      // Get all activities from the city
      const allActivities = await base44.entities.RunningActivity.list('-activity_date', limit);
      
      // Get user profiles to filter by city
      const userEmails = [...new Set(allActivities.map(a => a.user_email))];
      const profiles = await Promise.all(
        userEmails.map(email => 
          base44.entities.UserProfile.filter({ user_email: email })
            .then(p => p[0])
            .catch(() => null)
        )
      );
      
      // Filter activities by city
      const cityActivities = allActivities.filter(activity => {
        const profile = profiles.find(p => p?.user_email === activity.user_email);
        return profile?.city === userCity;
      });
      
      return cityActivities;
    },
    enabled: !!userCity,
    initialData: [],
  });

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h${mins}min`;
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/60">Carregando atividades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass-effect border-[#CEF17B]/20 p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.activity_type === 'corrida' 
                  ? 'bg-orange-500/20' 
                  : 'bg-blue-500/20'
              }`}>
                {activity.activity_type === 'corrida' ? (
                  <Footprints className="w-5 h-5 text-orange-400" />
                ) : (
                  <Bike className="w-5 h-5 text-blue-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-white">
                    {activity.user_email.split('@')[0]}
                  </p>
                  {activity.is_personal_record && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      PR
                    </Badge>
                  )}
                </div>
                
                <p className="text-xs text-white/60 mb-2">
                  {formatDistanceToNow(new Date(activity.activity_date), { addSuffix: true, locale: ptBR })}
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#CEF17B]" />
                    <span className="text-xs text-white">{activity.distance_km.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#CEF17B]" />
                    <span className="text-xs text-white">{formatTime(activity.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#CEF17B]" />
                    <span className="text-xs text-white">{activity.pace_avg || '--:--'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      
      {activities.length === 0 && (
        <Card className="glass-effect border-[#CEF17B]/20 p-8 text-center">
          <Footprints className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/60">Nenhuma atividade recente em {userCity}</p>
          <p className="text-white/40 text-xs mt-1">Seja o primeiro a correr!</p>
        </Card>
      )}
    </div>
  );
}