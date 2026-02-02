import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flame, Play, Pause, Square, Bike, Zap, Clock, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

export default function CardioWeekly() {
  const [user, setUser] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedType, setSelectedType] = useState("general");

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Get last 7 days cardio sessions
  const { data: weeklySessions = [] } = useQuery({
    queryKey: ['cardioSessions', user?.email],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const sessions = await base44.entities.CardioSession.filter({
        user_email: user.email
      });
      
      return sessions
        .filter(s => new Date(s.session_date) >= sevenDaysAgo)
        .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
    },
    enabled: !!user?.email,
    initialData: [],
  });

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  // Calculate calories (simple estimation: ~5 kcal/min for general cardio)
  const estimatedCalories = Math.round((seconds / 60) * 5);

  // Calculate weekly total
  const weeklyCalories = weeklySessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0);

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.CardioSession.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['cardioSessions']);
      queryClient.invalidateQueries(['todayFoods']);
      queryClient.invalidateQueries(['weekFoods']);
    },
  });

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleFinish = async () => {
    if (seconds < 60) {
      alert("Cardio muito curto! Tente pelo menos 1 minuto.");
      return;
    }

    await saveMutation.mutateAsync({
      user_email: user.email,
      cardio_type: selectedType,
      duration_seconds: seconds,
      calories_burned: estimatedCalories,
      session_date: new Date().toISOString()
    });

    // Reset
    setIsActive(false);
    setIsPaused(false);
    setSeconds(0);
  };

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const cardioTypes = [
    { id: "bike", name: "Bicicleta", emoji: "🚴", color: "blue" },
    { id: "run", name: "Corrida", emoji: "🏃", color: "orange" },
    { id: "walk", name: "Caminhada", emoji: "🚶", color: "green" },
    { id: "general", name: "Cardio Geral", icon: Zap, color: "purple" },
  ];

  const selectedCardio = cardioTypes.find(c => c.id === selectedType);

  const colorClasses = {
    blue: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    orange: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/30" },
    green: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    purple: { bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" }
  };

  const currentColors = colorClasses[selectedCardio?.color] || colorClasses.purple;

  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <p className="text-white">Por favor, faça login para acessar esta página.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-5">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-[#CEF17B]/30 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-white">CARDIO DA SEMANA</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Cardio da Semana
          </h1>
          
          <p className="text-sm text-[#CEEDB2]">
            Acompanhe seu gasto calórico em atividades cardiovasculares
          </p>
        </div>

        {/* Weekly Calories Counter */}
        <Card className="gradient-card p-6 border-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#084734]/70 font-medium mb-1">Calorias do Cardio (Semana)</p>
              <p className="text-3xl font-bold text-[#084734]">{weeklyCalories} kcal</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#084734]/20 flex items-center justify-center">
              <Flame className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </Card>

        {/* Active Counter */}
        <Card className={`glass-effect p-6 border-2 ${isActive ? currentColors.border : 'border-[#CEF17B]/20'} transition-all`}>
          <div className="text-center space-y-5">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-[#CEF17B]" />
              <h3 className="font-bold text-white text-lg">
                {isActive ? (isPaused ? 'Pausado' : 'Em Andamento') : 'Cardio Inativo'}
              </h3>
            </div>

            {/* Time Display */}
            <div className="py-6">
              <p className="text-5xl font-bold text-white mb-2">{formatTime(seconds)}</p>
              <div className="flex items-center justify-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <p className="text-lg text-[#CEEDB2]">{estimatedCalories} kcal estimadas</p>
              </div>
            </div>

            {/* Cardio Type Selector */}
            {!isActive && (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {cardioTypes.map(type => {
                  const Icon = type.icon;
                  const colors = colorClasses[type.color];
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-xl transition-all ${
                        isSelected 
                          ? `${colors.bg} border-2 ${colors.border} scale-105` 
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      {Icon ? (
                        <Icon className={`w-6 h-6 mx-auto ${isSelected ? colors.text : 'text-white/60'}`} />
                      ) : (
                        <span className="text-2xl">{type.emoji}</span>
                      )}
                      <p className="text-xs text-white mt-1 truncate">{type.name}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {isActive && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${currentColors.bg} ${currentColors.border} border`}>
                {selectedCardio?.icon ? (
                  <selectedCardio.icon className={`w-4 h-4 ${currentColors.text}`} />
                ) : (
                  <span>{selectedCardio?.emoji}</span>
                )}
                <span className={`text-sm font-semibold ${currentColors.text}`}>
                  {selectedCardio?.name}
                </span>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3">
              {!isActive ? (
                <Button
                  onClick={handleStart}
                  className="flex-1 h-14 bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 font-semibold text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Cardio
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handlePause}
                    className="flex-1 h-12 glass-effect border-[#CEF17B]/20 hover:bg-white/10 font-semibold"
                  >
                    <Pause className="w-5 h-5 mr-2" />
                    {isPaused ? 'Retomar' : 'Pausar'}
                  </Button>
                  <Button
                    onClick={handleFinish}
                    disabled={saveMutation.isPending}
                    className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    <Square className="w-5 h-5 mr-2" />
                    Finalizar
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Weekly History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm">Últimos Cardios da Semana</h3>
            <Badge className="bg-white/10 text-white/70 border-0 text-xs">
              {weeklySessions.length} sessões
            </Badge>
          </div>

          {weeklySessions.length === 0 ? (
            <Card className="glass-effect border-[#CEF17B]/20 p-8 text-center">
              <p className="text-white/60">Nenhum cardio registrado esta semana</p>
              <p className="text-xs text-white/40 mt-2">Inicie sua primeira sessão acima!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {weeklySessions.map((session, idx) => {
                const cardioInfo = cardioTypes.find(c => c.id === session.cardio_type) || cardioTypes[3];
                const colors = colorClasses[cardioInfo.color];
                const date = new Date(session.session_date);
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="glass-effect border-[#CEF17B]/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                            {cardioInfo.icon ? (
                              <cardioInfo.icon className={`w-5 h-5 ${colors.text}`} />
                            ) : (
                              <span className="text-xl">{cardioInfo.emoji}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{cardioInfo.name}</p>
                            <p className="text-xs text-white/60">
                              {isToday ? 'Hoje' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                              {' • '}
                              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end mb-1">
                            <Clock className="w-3 h-3 text-[#CEF17B]" />
                            <p className="text-sm font-semibold text-white">
                              {Math.floor(session.duration_seconds / 60)} min
                            </p>
                          </div>
                          <div className="flex items-center gap-1 justify-end">
                            <Flame className="w-3 h-3 text-orange-400" />
                            <p className="text-sm font-semibold text-orange-400">
                              {session.calories_burned} kcal
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reset Info */}
        <Card className="glass-effect border-[#CEF17B]/20 p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 text-xs">
            <RefreshCw className="w-3 h-3" />
            <span>O acompanhamento reinicia toda semana para estimular consistência</span>
          </div>
        </Card>

      </div>
    </div>
  );
}