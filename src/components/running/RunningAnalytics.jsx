import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Zap, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RunningAnalytics({ activities = [] }) {
  const analytics = useMemo(() => {
    if (activities.length === 0) return null;

    // Sort by date
    const sorted = [...activities].sort((a, b) => 
      new Date(a.activity_date) - new Date(b.activity_date)
    );

    // Last 7 days data
    const last7Days = sorted.slice(-7);
    const distanceData = last7Days.map(act => ({
      date: new Date(act.activity_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      distance: parseFloat(act.distance_km.toFixed(2)),
      pace: act.pace_avg
    }));

    // Calculate trends
    const recentActivities = sorted.slice(-5);
    const olderActivities = sorted.slice(-10, -5);
    
    const avgRecentPace = recentActivities.reduce((sum, act) => {
      const [mins, secs] = act.pace_avg.split(':').map(Number);
      return sum + (mins * 60 + secs);
    }, 0) / recentActivities.length;

    const avgOlderPace = olderActivities.length > 0 ? olderActivities.reduce((sum, act) => {
      const [mins, secs] = act.pace_avg.split(':').map(Number);
      return sum + (mins * 60 + secs);
    }, 0) / olderActivities.length : avgRecentPace;

    const paceTrend = avgRecentPace < avgOlderPace ? 'improving' : 
                      avgRecentPace > avgOlderPace ? 'declining' : 'stable';

    const avgRecentDistance = recentActivities.reduce((sum, act) => sum + act.distance_km, 0) / recentActivities.length;
    const avgOlderDistance = olderActivities.length > 0 ? olderActivities.reduce((sum, act) => sum + act.distance_km, 0) / olderActivities.length : avgRecentDistance;
    
    const distanceTrend = avgRecentDistance > avgOlderDistance ? 'improving' : 
                          avgRecentDistance < avgOlderDistance ? 'declining' : 'stable';

    // Personal records
    const longestRun = sorted.reduce((max, act) => act.distance_km > max ? act.distance_km : max, 0);
    const fastestPace = sorted.reduce((fastest, act) => {
      const [mins, secs] = act.pace_avg.split(':').map(Number);
      const paceSeconds = mins * 60 + secs;
      const [fastMins, fastSecs] = fastest.split(':').map(Number);
      const fastSeconds = fastMins * 60 + fastSecs;
      return paceSeconds < fastSeconds ? act.pace_avg : fastest;
    }, '99:99');

    return {
      distanceData,
      paceTrend,
      distanceTrend,
      avgRecentPace: Math.floor(avgRecentPace / 60) + ':' + String(Math.round(avgRecentPace % 60)).padStart(2, '0'),
      avgRecentDistance: avgRecentDistance.toFixed(1),
      longestRun: longestRun.toFixed(2),
      fastestPace,
      totalActivities: activities.length,
      totalDistance: activities.reduce((sum, act) => sum + act.distance_km, 0).toFixed(1),
      totalCalories: activities.reduce((sum, act) => sum + (act.calories_burned || 0), 0)
    };
  }, [activities]);

  if (!analytics) {
    return (
      <Card className="glass-effect p-12 border-[#CEF17B]/20 text-center">
        <p className="text-white/60">Dados insuficientes para análise</p>
        <p className="text-sm text-[#CEEDB2] mt-2">Complete mais atividades para ver suas estatísticas</p>
      </Card>
    );
  }

  const TrendIcon = analytics.paceTrend === 'improving' ? TrendingUp : 
                    analytics.paceTrend === 'declining' ? TrendingDown : Minus;
  
  return (
    <div className="space-y-6">
      
      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-effect p-4 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Pace Médio</p>
            <TrendIcon className={`w-4 h-4 ${
              analytics.paceTrend === 'improving' ? 'text-green-400' : 
              analytics.paceTrend === 'declining' ? 'text-red-400' : 'text-[#CEF17B]'
            }`} />
          </div>
          <p className="text-2xl font-bold text-white">{analytics.avgRecentPace}</p>
          <p className="text-xs text-[#CEEDB2]">últimas 5 corridas</p>
        </Card>

        <Card className="glass-effect p-4 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Distância Média</p>
            <Target className="w-4 h-4 text-[#CEF17B]" />
          </div>
          <p className="text-2xl font-bold text-white">{analytics.avgRecentDistance} km</p>
          <p className="text-xs text-[#CEEDB2]">por corrida</p>
        </Card>

        <Card className="glass-effect p-4 border-[#CEF17B]/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-white/60">Total do Mês</p>
            <Calendar className="w-4 h-4 text-[#CEF17B]" />
          </div>
          <p className="text-2xl font-bold text-white">{analytics.totalDistance} km</p>
          <p className="text-xs text-[#CEEDB2]">{analytics.totalActivities} atividades</p>
        </Card>
      </div>

      {/* Distance Chart */}
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <h3 className="font-bold text-white mb-4">Últimas 7 Corridas</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analytics.distanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#CEEDB2" />
            <YAxis stroke="#CEEDB2" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#084734', border: '1px solid #CEF17B' }}
              labelStyle={{ color: '#CEF17B' }}
            />
            <Bar dataKey="distance" fill="#CEF17B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Personal Records */}
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <h3 className="font-bold text-white mb-4">Recordes Pessoais</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <p className="text-sm text-yellow-400 mb-1">🏆 Corrida Mais Longa</p>
            <p className="text-2xl font-bold text-white">{analytics.longestRun} km</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-sm text-green-400 mb-1">⚡ Pace Mais Rápido</p>
            <p className="text-2xl font-bold text-white">{analytics.fastestPace}</p>
          </div>
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-blue-400 mb-1">🔥 Total de Calorias</p>
            <p className="text-2xl font-bold text-white">{analytics.totalCalories} kcal</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-sm text-purple-400 mb-1">📊 Total de Atividades</p>
            <p className="text-2xl font-bold text-white">{analytics.totalActivities}</p>
          </div>
        </div>
      </Card>

    </div>
  );
}