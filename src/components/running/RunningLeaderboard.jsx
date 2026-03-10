import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, MapPin, TrendingUp, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function RunningLeaderboard({ userEmail, userCity }) {
  const [period, setPeriod] = useState("week"); // week, month, all

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['cityLeaderboard', userCity, period],
    queryFn: async () => {
      if (!userCity) return [];
      const leaders = await base44.entities.CityLeaderboard.filter({ city: userCity });
      
      // Sort by appropriate metric
      const sorted = leaders.sort((a, b) => {
        if (period === 'week') return (b.week_distance_km || 0) - (a.week_distance_km || 0);
        if (period === 'month') return (b.month_distance_km || 0) - (a.month_distance_km || 0);
        return (b.total_distance_km || 0) - (a.total_distance_km || 0);
      });
      
      return sorted.slice(0, 50);
    },
    enabled: !!userCity,
    initialData: [],
  });

  const userPosition = leaderboard.findIndex(l => l.user_email === userEmail) + 1;
  const userStats = leaderboard.find(l => l.user_email === userEmail);

  const getRankIcon = (position) => {
    if (position === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (position === 3) return <Award className="w-6 h-6 text-amber-700" />;
    return null;
  };

  const getDistanceByPeriod = (leader) => {
    if (period === 'week') return leader.week_distance_km || 0;
    if (period === 'month') return leader.month_distance_km || 0;
    return leader.total_distance_km || 0;
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-white/60">Carregando ranking...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Period Selector */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setPeriod("week")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            period === "week" 
              ? "bg-[#CEF17B] text-[#084734]" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Esta Semana
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            period === "month" 
              ? "bg-[#CEF17B] text-[#084734]" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Este Mês
        </button>
        <button
          onClick={() => setPeriod("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            period === "all" 
              ? "bg-[#CEF17B] text-[#084734]" 
              : "bg-white/10 text-white/70 hover:bg-white/20"
          }`}
        >
          Geral
        </button>
      </div>

      {/* User Position Card */}
      {userStats && (
        <Card className="glass-effect border-[#CEF17B] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                <span className="text-[#CEF17B] font-bold text-lg">#{userPosition}</span>
              </div>
              <div>
                <p className="font-bold text-white">Sua Posição em {userCity}</p>
                <p className="text-xs text-[#CEEDB2]">
                  {getDistanceByPeriod(userStats).toFixed(1)} km • {userStats.total_runs || 0} corridas
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
          </div>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.slice(0, 3).length > 0 && (
        <Card className="glass-effect border-[#CEF17B]/20 p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {leaderboard.slice(0, 3).map((leader, idx) => (
              <motion.div
                key={leader.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`text-center ${idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'}`}
              >
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  idx === 0 ? 'bg-yellow-500/20' : idx === 1 ? 'bg-gray-400/20' : 'bg-amber-700/20'
                }`}>
                  {getRankIcon(idx + 1)}
                </div>
                <p className="font-bold text-white text-sm truncate">{leader.user_name || leader.user_email.split('@')[0]}</p>
                <p className="text-[#CEF17B] font-bold text-lg">{getDistanceByPeriod(leader).toFixed(1)} km</p>
                <p className="text-xs text-white/60">{leader.total_runs || 0} corridas</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Full Ranking List */}
      <Card className="glass-effect border-[#CEF17B]/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Ranking - {userCity}</h3>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboard.map((leader, index) => {
            const isCurrentUser = leader.user_email === userEmail;
            
            return (
              <motion.div
                key={leader.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  isCurrentUser 
                    ? 'bg-[#CEF17B]/20 border border-[#CEF17B]' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="w-8 text-center">
                  {index < 3 ? (
                    getRankIcon(index + 1)
                  ) : (
                    <span className="text-white/60 font-bold">#{index + 1}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <p className={`font-semibold ${isCurrentUser ? 'text-[#CEF17B]' : 'text-white'}`}>
                    {leader.user_name || leader.user_email.split('@')[0]}
                    {isCurrentUser && <span className="ml-2 text-xs">(Você)</span>}
                  </p>
                  <p className="text-xs text-white/60">
                    {leader.total_runs || 0} corridas • {leader.best_pace || '--:--'} melhor pace
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-white">{getDistanceByPeriod(leader).toFixed(1)}</p>
                  <p className="text-xs text-[#CEEDB2]">km</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {leaderboard.length === 0 && (
          <div className="text-center py-8">
            <Flame className="w-12 h-12 text-white/20 mx-auto mb-2" />
            <p className="text-white/60 text-sm">Nenhum corredor em {userCity} ainda.</p>
            <p className="text-white/40 text-xs mt-1">Seja o primeiro!</p>
          </div>
        )}
      </Card>
    </div>
  );
}