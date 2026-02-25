import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Zap, TrendingUp, Image, AlertCircle, CheckCircle, Flame } from "lucide-react";
import { motion } from "framer-motion";

export default function MyRoutine() {
  const [user, setUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [weekStartDate, setWeekStartDate] = useState(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    return weekStart.toISOString().split("T")[0];
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch routine metrics
  const { data: metrics } = useQuery({
    queryKey: ["routineMetrics", user?.email, selectedMonth],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.RoutineMetrics.filter({
        user_email: user.email,
        month: selectedMonth
      });
      return data[0] || null;
    },
    enabled: !!user?.email
  });

  // Fetch weekly goal
  const { data: weeklyGoal } = useQuery({
    queryKey: ["weeklyGoal", user?.email, weekStartDate],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.WeeklyGoal.filter({
        user_email: user.email,
        week_start_date: weekStartDate
      });
      return data[0] || null;
    },
    enabled: !!user?.email
  });

  // Fetch streak
  const { data: streak } = useQuery({
    queryKey: ["streak", user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const data = await base44.entities.Streak.filter({
        user_email: user.email
      });
      return data[0] || null;
    },
    enabled: !!user?.email
  });

  // Fetch performance history
  const { data: performanceHistory = [] } = useQuery({
    queryKey: ["performanceHistory", user?.email, selectedMonth],
    queryFn: async () => {
      if (!user?.email) return [];
      const monthStart = `${selectedMonth}-01`;
      const data = await base44.entities.PerformanceHistory.filter({
        user_email: user.email
      });
      return data.filter(p => p.date?.startsWith(selectedMonth)).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    enabled: !!user?.email,
    initialData: []
  });

  // Fetch alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ["routineAlerts", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const data = await base44.entities.RoutineAlert.filter({
        user_email: user.email,
        is_active: true
      });
      return data;
    },
    enabled: !!user?.email,
    initialData: []
  });

  // Fetch evolution photos
  const { data: photos = [] } = useQuery({
    queryKey: ["evolutionPhotos", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const data = await base44.entities.EvolutionPhoto.filter({
        user_email: user.email
      });
      return data.sort((a, b) => new Date(b.photo_date) - new Date(a.photo_date));
    },
    enabled: !!user?.email,
    initialData: []
  });

  const dismissAlertMutation = useMutation({
    mutationFn: async (alertId) => {
      return base44.entities.RoutineAlert.update(alertId, {
        is_active: false,
        dismissed_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["routineAlerts"]);
    }
  });

  const goalPercentage = weeklyGoal 
    ? (weeklyGoal.completed_workouts / weeklyGoal.target_workouts) * 100 
    : 0;

  if (!user) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p className="text-[#CEEDB2]">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-28">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Minha Rotina</h1>
          <p className="text-[#CEEDB2]">Acompanhe sua performance, constância e evolução</p>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {alerts.map((alert) => (
              <Card key={alert.id} className="glass-effect border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white">{alert.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlertMutation.mutate(alert.id)}
                    className="text-[#CEEDB2] hover:text-white h-6 px-2"
                  >
                    ✕
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-[#CEF17B]/20">
            <TabsTrigger value="week" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
              <Calendar className="w-4 h-4 mr-2" />
              Semana
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="evolution" className="data-[state=active]:bg-[#CEF17B]/20 data-[state=active]:text-[#CEF17B]">
              <Image className="w-4 h-4 mr-2" />
              Evolução
            </TabsTrigger>
          </TabsList>

          {/* TAB: WEEK */}
          <TabsContent value="week" className="space-y-6 mt-6">
            
            {/* Meta Semanal */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Meta Semanal</h3>
                  <p className="text-sm text-[#CEEDB2]">Semana de {weekStartDate}</p>
                </div>
                <Badge className={`${goalPercentage >= 100 ? "bg-green-500/20 text-green-300" : "bg-[#CEF17B]/20 text-[#CEF17B]"} border-0`}>
                  {weeklyGoal?.completed_workouts || 0}/{weeklyGoal?.target_workouts || 0}
                </Badge>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#CEF17B] to-[#CEEDB2]"
                  animate={{ width: `${Math.min(goalPercentage, 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="flex justify-between mt-3">
                <span className="text-xs text-[#CEEDB2]">0%</span>
                <span className="text-xs text-white font-bold">{Math.round(goalPercentage)}%</span>
                <span className="text-xs text-[#CEEDB2]">100%</span>
              </div>

              {goalPercentage >= 100 && (
                <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                  <p className="text-sm text-green-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Meta da semana atingida! 🎉
                  </p>
                </div>
              )}
            </Card>

            {/* Sequência Ativa */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center">
                  <Flame className="w-8 h-8 text-[#CEF17B]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Sequência Ativa</h3>
                  <p className="text-sm text-[#CEEDB2]">Semanas consecutivas</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#CEF17B]">{streak?.current_streak || 0}</p>
                  <p className="text-xs text-[#CEEDB2]">Melhor: {streak?.longest_streak || 0}</p>
                </div>
              </div>
            </Card>

            {/* Calendário (Mockado visualmente) */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Calendário do Mês</h3>
              <p className="text-sm text-[#CEEDB2] text-center p-4">
                Calendário integrado ao sistema de treinos concluídos
              </p>
            </Card>
          </TabsContent>

          {/* TAB: PERFORMANCE */}
          <TabsContent value="performance" className="space-y-6 mt-6">
            
            {/* IPS - Índice de Performance */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <div className="text-center mb-6">
                <p className="text-sm text-[#CEEDB2] mb-2">Índice de Performance SlatFit</p>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-5xl font-bold text-[#CEF17B]"
                >
                  {Math.round(metrics?.performance_index || 0)}
                </motion.div>
                <p className="text-xs text-white/60 mt-2">de 100</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#CEEDB2] mb-1">Constância (40%)</p>
                  <p className="text-lg font-bold text-white">{Math.round((metrics?.performance_index || 0) * 0.4)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#CEEDB2] mb-1">Volume (30%)</p>
                  <p className="text-lg font-bold text-white">{Math.round((metrics?.performance_index || 0) * 0.3)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#CEEDB2] mb-1">Intensidade (20%)</p>
                  <p className="text-lg font-bold text-white">{Math.round((metrics?.performance_index || 0) * 0.2)}</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-[#CEEDB2] mb-1">Desafios (10%)</p>
                  <p className="text-lg font-bold text-white">{Math.round((metrics?.performance_index || 0) * 0.1)}</p>
                </div>
              </div>
            </Card>

            {/* Métricas do Mês */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Métricas de {selectedMonth}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-[#CEEDB2]">Treinos Concluídos</span>
                  <span className="text-lg font-bold text-white">{metrics?.workouts_completed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-[#CEEDB2]">Volume Total</span>
                  <span className="text-lg font-bold text-white">{Math.round(metrics?.total_volume || 0)} séries</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-[#CEEDB2]">XP Acumulado</span>
                  <span className="text-lg font-bold text-[#CEF17B]">{metrics?.xp_accumulated || 0} XP</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-[#CEEDB2]">Frequência Média</span>
                  <span className="text-lg font-bold text-white">{metrics?.average_weekly_frequency?.toFixed(1) || 0}x/sem</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-[#CEEDB2]">Melhor Sequência</span>
                  <span className="text-lg font-bold text-white">{metrics?.best_streak || 0} sem</span>
                </div>
              </div>
            </Card>

            {/* Histórico de Performance */}
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Histórico IPS</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {performanceHistory.length > 0 ? (
                  performanceHistory.slice(0, 10).map((perf) => (
                    <div key={perf.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                      <span className="text-[#CEEDB2]">{perf.date}</span>
                      <span className="font-bold text-white">{Math.round(perf.performance_index)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[#CEEDB2] text-sm text-center py-4">Sem dados ainda</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* TAB: EVOLUTION */}
          <TabsContent value="evolution" className="space-y-6 mt-6">
            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Fotos de Evolução</h3>
              <p className="text-sm text-[#CEEDB2] mb-4">Upload de fotos (frente, lado, costas) e rastreamento de medidas</p>
              
              {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img 
                        src={photo.photo_url} 
                        alt={`Foto ${photo.photo_type} - ${photo.photo_date}`}
                        className="w-full h-48 object-cover rounded-lg border border-[#CEF17B]/20"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-[#CEF17B] font-bold text-sm capitalize">{photo.photo_type}</p>
                          <p className="text-white text-xs">{photo.photo_date}</p>
                          {photo.weight && <p className="text-[#CEEDB2] text-xs mt-1">{photo.weight}kg</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-white/5 rounded-lg border border-[#CEF17B]/20">
                  <Image className="w-8 h-8 text-[#CEEDB2]/50 mx-auto mb-2" />
                  <p className="text-[#CEEDB2] text-sm">Nenhuma foto de evolução ainda</p>
                  <p className="text-white/50 text-xs mt-1">Comece a rastrear sua transformação!</p>
                </div>
              )}
            </Card>

            <Card className="glass-effect border-[#CEF17B]/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Medidas Corporais</h3>
              <p className="text-sm text-[#CEEDB2]">Histórico de peso e medidas vinculadas às fotos</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}