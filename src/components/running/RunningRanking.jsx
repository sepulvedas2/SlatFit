import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, MapPin, Target, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function RunningRanking({ userEmail, userName }) {
  const [period, setPeriod] = useState("weekly");
  const [userCity, setUserCity] = useState(null);
  const queryClient = useQueryClient();

  // Get user profile for city
  const { data: profile } = useQuery({
    queryKey: ['userProfile', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      return profiles[0] || null;
    },
    enabled: !!userEmail,
  });

  // Get user's recent activities to detect city
  const { data: recentActivity } = useQuery({
    queryKey: ['recentActivity', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const activities = await base44.entities.RunningActivity.filter({ 
        user_email: userEmail 
      }, '-activity_date', 1);
      return activities[0] || null;
    },
    enabled: !!userEmail,
  });

  // Detect city from GPS (simulate for now, in real app use reverse geocoding)
  useEffect(() => {
    if (recentActivity && recentActivity.route_data && recentActivity.route_data.length > 0) {
      // In real app: fetch city from reverse geocoding API
      // For now, use a default
      setUserCity("São Paulo");
    } else {
      setUserCity("São Paulo"); // Default
    }
  }, [recentActivity]);

  // Get current period date
  const getPeriodDate = (periodType) => {
    const today = new Date();
    if (periodType === "daily") {
      return today.toISOString().split('T')[0];
    } else if (periodType === "weekly") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1);
      return startOfWeek.toISOString().split('T')[0];
    } else {
      return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
    }
  };

  // Get ranking data
  const { data: rankingData = [], isLoading } = useQuery({
    queryKey: ['cityRanking', userCity, period],
    queryFn: async () => {
      if (!userCity) return [];
      const periodDate = getPeriodDate(period);
      const rankings = await base44.entities.CityRanking.filter({
        city: userCity,
        period: period,
        period_date: periodDate
      }, '-total_distance_km');
      
      // Add rank positions
      return rankings.map((rank, index) => ({
        ...rank,
        rank_position: index + 1
      }));
    },
    enabled: !!userCity,
    initialData: [],
  });

  const userRanking = rankingData.find(r => r.user_email === userEmail);
  const topThree = rankingData.slice(0, 3);
  const restOfRankings = rankingData.slice(3, 20);

  const getRankIcon = (position) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-orange-400" />;
    return <Trophy className="w-4 h-4 text-[#CEF17B]" />;
  };

  const getRankColor = (position) => {
    if (position === 1) return "bg-yellow-500/20 border-yellow-500/40";
    if (position === 2) return "bg-gray-400/20 border-gray-400/40";
    if (position === 3) return "bg-orange-500/20 border-orange-500/40";
    return "bg-white/5 border-white/10";
  };

  if (!userCity) {
    return (
      <Card className="glass-effect p-12 border-[#CEF17B]/20 text-center">
        <MapPin className="w-16 h-16 text-[#CEF17B]/40 mx-auto mb-4" />
        <p className="text-white/60 mb-2">Detectando sua localização...</p>
        <p className="text-sm text-[#CEEDB2]">Complete uma corrida para aparecer no ranking</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-[#CEF17B]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Ranking - {userCity}</h2>
          <p className="text-[#CEEDB2]">Compete com corredores da sua cidade</p>
        </div>
      </div>

      {/* Period Selector */}
      <Tabs value={period} onValueChange={setPeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-[#CEF17B]/20">
          <TabsTrigger value="daily" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
            Diário
          </TabsTrigger>
          <TabsTrigger value="weekly" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
            Semanal
          </TabsTrigger>
          <TabsTrigger value="monthly" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
            Mensal
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* User Position Card */}
      {userRanking && (
        <Card className="glass-effect p-6 border-[#CEF17B] bg-[#CEF17B]/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#CEF17B]/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#CEF17B]">#{userRanking.rank_position}</span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-white">Sua Posição</p>
              <p className="text-sm text-[#CEEDB2]">{userRanking.total_distance_km.toFixed(1)} km • {userRanking.activities_count} atividades</p>
            </div>
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
              Top {Math.round((userRanking.rank_position / rankingData.length) * 100)}%
            </Badge>
          </div>
        </Card>
      )}

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {topThree.map((rank, index) => (
            <motion.div
              key={rank.user_email}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`glass-effect p-4 border ${getRankColor(rank.rank_position)}`}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                    {getRankIcon(rank.rank_position)}
                  </div>
                  <p className="font-bold text-white text-sm mb-1 truncate">
                    {rank.user_name || rank.user_email.split('@')[0]}
                  </p>
                  <p className="text-xl font-bold text-[#CEF17B]">{rank.total_distance_km.toFixed(1)}</p>
                  <p className="text-xs text-white/60">km</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Rest of Rankings */}
      {restOfRankings.length > 0 && (
        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="space-y-3">
            {restOfRankings.map((rank) => (
              <div
                key={rank.user_email}
                className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                  rank.user_email === userEmail 
                    ? 'bg-[#CEF17B]/20 border border-[#CEF17B]/40' 
                    : 'bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">#{rank.rank_position}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">
                    {rank.user_name || rank.user_email.split('@')[0]}
                  </p>
                  <p className="text-xs text-[#CEEDB2]">
                    {rank.activities_count} atividades • {rank.avg_pace || '--:--'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-white">{rank.total_distance_km.toFixed(1)}</p>
                  <p className="text-xs text-white/60">km</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {rankingData.length === 0 && !isLoading && (
        <Card className="glass-effect p-12 border-[#CEF17B]/20 text-center">
          <Trophy className="w-16 h-16 text-[#CEF17B]/40 mx-auto mb-4" />
          <p className="text-white/60 mb-2">Ainda não há ranking neste período</p>
          <p className="text-sm text-[#CEEDB2]">Seja o primeiro a correr em {userCity}!</p>
        </Card>
      )}

    </div>
  );
}