import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, subDays } from "date-fns";

export default function ProgressStats({ userEmail }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  const { data: weekData = [] } = useQuery({
    queryKey: ['weekNutritionData', userEmail],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail
      });
      return data.filter(d => d.log_date >= weekAgo);
    },
    enabled: !!userEmail,
  });

  const { data: todayData } = useQuery({
    queryKey: ['nutritionData', userEmail, today],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail,
        log_date: today
      });
      return data[0] || null;
    },
    enabled: !!userEmail,
  });

  const { data: yesterdayData } = useQuery({
    queryKey: ['nutritionData', userEmail, yesterday],
    queryFn: async () => {
      const data = await base44.entities.NutritionData.filter({
        user_email: userEmail,
        log_date: yesterday
      });
      return data[0] || null;
    },
    enabled: !!userEmail,
  });

  const consistentDays = weekData.filter(d => d.consistency_score >= 60).length;
  const avgScore = weekData.length > 0
    ? Math.round(weekData.reduce((sum, d) => sum + (d.consistency_score || 0), 0) / weekData.length)
    : 0;

  const todayScore = todayData?.consistency_score || 0;
  const yesterdayScore = yesterdayData?.consistency_score || 0;
  const scoreDiff = todayScore - yesterdayScore;

  const getTrendIcon = (diff) => {
    if (diff > 10) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (diff < -10) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const stats = [
    {
      label: "Dias Consistentes",
      value: consistentDays,
      sublabel: "Esta semana",
      icon: "📅"
    },
    {
      label: "Score de Rotina",
      value: `${avgScore}%`,
      sublabel: `${scoreDiff > 0 ? '+' : ''}${scoreDiff}% vs ontem`,
      icon: "🔥",
      trend: getTrendIcon(scoreDiff)
    },
    {
      label: "Conteúdos Lidos",
      value: "12",
      sublabel: "Aprendizado",
      icon: "📚"
    }
  ];

  return (
    <Card className="glass-effect border-[#CEF17B]/20 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
        <h3 className="font-bold text-white">Seu Progresso</h3>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-white/5 rounded-2xl">
            <p className="text-3xl mb-2">{stat.icon}</p>
            <p className="text-2xl font-bold text-[#CEF17B] mb-1 flex items-center justify-center gap-1">
              {stat.value}
              {stat.trend}
            </p>
            <p className="text-xs text-white font-medium mb-1">{stat.label}</p>
            <p className="text-xs text-[#CEEDB2]">{stat.sublabel}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}