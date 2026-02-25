import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  User, Target, Activity, Save, Loader2, Crown,
  Moon, Sun, Bell, Edit, RotateCcw, Droplets, Flame, TrendingUp, Zap
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { format } from "date-fns";
import { useTheme } from "@/components/ThemeContext";

const goalLabels = {
  weight_loss: "Emagrecimento",
  muscle_gain: "Ganho de Massa",
  maintenance: "Manutenção",
};
const goalEmoji = {
  weight_loss: "🔥",
  muscle_gain: "💪",
  maintenance: "⚖️",
};
const goalMotivation = {
  weight_loss: "Cada treino é um passo em direção à melhor versão de você!",
  muscle_gain: "Força se constrói com consistência. Continue!",
  maintenance: "Equilíbrio é a chave para uma vida saudável e longeva.",
};
const activityLabels = {
  sedentary: "Sedentário",
  light: "Leve (1–3x/sem)",
  moderate: "Moderado (3–5x/sem)",
  active: "Ativo (6–7x/sem)",
  very_active: "Muito Ativo (2x/dia)",
};

function calcIMC(weight, height) {
  if (!weight || !height) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["userProfile", user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: workoutLogs = [] } = useQuery({
    queryKey: ["profileWorkoutLogs", user?.email],
    queryFn: () => base44.entities.WorkoutLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else if (user) {
      setFormData({
        user_email: user.email,
        height: 170,
        current_weight: 70,
        target_weight: 70,
        goal: "maintenance",
        activity_level: "moderate",
        gender: "male",
        age: 25,
        body_type: "mesomorph",
        daily_calorie_target: 2000,
        protein_target: 150,
        carbs_target: 200,
        fats_target: 60,
      });
    }
  }, [profile, user]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) return base44.entities.UserProfile.update(profile.id, data);
      return base44.entities.UserProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja restaurar os dados do perfil? Isso recarregará as informações salvas.")) {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setEditing(false);
    }
  };

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const imc = calcIMC(profile?.current_weight, profile?.height);
  const diff = profile ? Math.abs((profile.target_weight || 0) - (profile.current_weight || 0)).toFixed(1) : null;
  const isGain = profile && profile.target_weight > profile.current_weight;

  // Progress bar (current -> target)
  let progressPct = 0;
  if (profile?.current_weight && profile?.target_weight) {
    if (profile.goal === "weight_loss") {
      // assume started 10kg above target as baseline
      const start = profile.target_weight + 10;
      progressPct = Math.min(100, Math.max(0, ((start - profile.current_weight) / (start - profile.target_weight)) * 100));
    } else {
      const start = Math.max(0, profile.target_weight - 10);
      progressPct = Math.min(100, Math.max(0, ((profile.current_weight - start) / (profile.target_weight - start)) * 100));
    }
  }

  // Weight chart data from workout logs (last 10 entries with a calories proxy)
  const chartData = workoutLogs.slice(-10).map((log, i) => ({
    day: i + 1,
    peso: (profile?.current_weight || 70) - i * 0.2,
  })).reverse();

  const waterGoal = profile?.body_type === "endomorph" ? 3000 : profile?.body_type === "ectomorph" ? 2000 : 2500;

  // Theme-aware classes
  const bg = isDark ? "bg-[#0F1C1B]" : "bg-[#084734]";
  const cardBg = isDark ? "bg-[#162A28] border-white/10" : "glass-effect border-[#CEF17B]/20";
  const textPrimary = "text-white";
  const textSecondary = isDark ? "text-[#A0B5B2]" : "text-[#CEEDB2]";

  return (
    <div className={`min-h-screen pb-28 transition-colors duration-200 ${bg}`}>
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* ─── BLOCO 1: HEADER PREMIUM ─── */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#CEF17B]/20 border-2 border-[#CEF17B]/40 flex items-center justify-center">
              <User className="w-10 h-10 text-[#CEF17B]" />
            </div>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#CEF17B] flex items-center justify-center">
                <Crown className="w-3.5 h-3.5 text-[#084734]" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">{user?.full_name || "Usuário"}</h1>
            <p className={`text-sm ${textSecondary}`}>{user?.email}</p>
          </div>

          {profile?.goal && (
            <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border border-[#CEF17B]/30 text-xs px-3 py-1">
              {goalEmoji[profile.goal]} {goalLabels[profile.goal]}
            </Badge>
          )}

          {profile?.goal && (
            <p className={`text-xs ${textSecondary} max-w-xs`}>
              {goalMotivation[profile.goal]}
            </p>
          )}
        </div>

        {/* ─── BLOCO 2: RESUMO FÍSICO 2x2 ─── */}
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Activity className="w-5 h-5 text-blue-400" />, value: `${profile.current_weight} kg`, label: "Peso Atual", bg: "bg-blue-400/10" },
              { icon: <Target className="w-5 h-5 text-[#CEF17B]" />, value: `${profile.target_weight} kg`, label: "Peso Meta", bg: "bg-[#CEF17B]/10" },
              { icon: <TrendingUp className="w-5 h-5 text-purple-400" />, value: imc ? `IMC ${imc}` : "—", label: "Índice de Massa", bg: "bg-purple-400/10" },
              { icon: <Zap className="w-5 h-5 text-orange-400" />, value: diff ? `${isGain ? "+" : "-"}${diff} kg` : "—", label: "Faltam para a meta", bg: "bg-orange-400/10" },
            ].map((card, i) => (
              <Card key={i} className={`${cardBg} p-4`}>
                <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center mb-2`}>
                  {card.icon}
                </div>
                <p className="text-xl font-black text-white">{card.value}</p>
                <p className={`text-xs ${textSecondary}`}>{card.label}</p>
              </Card>
            ))}
          </div>
        )}

        {/* ─── BLOCO 3: BARRA DE PROGRESSO ─── */}
        {profile && (
          <Card className={`${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#CEF17B]" />
              <h3 className="text-white font-bold text-sm">Progresso Visual</h3>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span className={textSecondary}>{profile.current_weight} kg</span>
              <span className={`text-[#CEF17B] font-semibold`}>{Math.round(progressPct)}%</span>
              <span className={textSecondary}>{profile.target_weight} kg</span>
            </div>
            <Progress
              value={progressPct}
              className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#CEF17B] [&>div]:to-green-400 [&>div]:transition-all [&>div]:duration-1000"
            />
            <p className={`text-xs ${textSecondary} mt-2 text-center`}>
              {progressPct >= 100 ? "🎉 Meta atingida!" : `${diff} kg ${isGain ? "para ganhar" : "para perder"}`}
            </p>
          </Card>
        )}

        {/* ─── BLOCO 4: MINI GRÁFICO ─── */}
        {chartData.length > 2 && (
          <Card className={`${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#CEF17B]" />
              <h3 className="text-white font-bold text-sm">Evolução do Peso</h3>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData}>
                <YAxis domain={["auto", "auto"]} hide />
                <Tooltip
                  contentStyle={{ background: "#162A28", border: "1px solid rgba(206,241,123,0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v) => [`${v} kg`, "Peso"]}
                  labelFormatter={() => ""}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#CEF17B"
                  strokeWidth={2}
                  dot={{ fill: "#CEF17B", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ─── BLOCO 5: INDICADORES INTELIGENTES ─── */}
        {profile && (
          <Card className={`${cardBg} p-5`}>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-[#CEF17B]" />
              <h3 className="text-white font-bold text-sm">Indicadores Inteligentes</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: <Flame className="w-4 h-4 text-orange-400" />, label: "Calorias diárias", value: `${profile.daily_calorie_target || 2000} kcal` },
                { icon: <TrendingUp className="w-4 h-4 text-blue-400" />, label: "Proteína diária", value: `${profile.protein_target || 150} g` },
                { icon: <Droplets className="w-4 h-4 text-cyan-400" />, label: "Meta de água", value: `${(waterGoal / 1000).toFixed(1)} L/dia` },
                { icon: <Activity className="w-4 h-4 text-purple-400" />, label: "Nível de atividade", value: activityLabels[profile.activity_level] || "—" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className={`text-sm ${textSecondary}`}>{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ─── BLOCO 6: CONFIGURAÇÕES ─── */}
        <Card className={`${cardBg} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#CEF17B]" />
            <h3 className="text-white font-bold text-sm">Configurações</h3>
          </div>

          <div className="space-y-3">
            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-[#CEF17B]" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                <span className="text-white text-sm font-medium">Modo Noturno</span>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${isDark ? "bg-[#CEF17B]" : "bg-white/20"}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-200 ${isDark ? "left-5" : "left-1"}`} />
              </div>
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => setEditing(!editing)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Edit className="w-5 h-5 text-blue-400" />
              <span className="text-white text-sm font-medium">Editar Dados</span>
            </button>

            {/* Notifications */}
            <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-purple-400" />
              <span className="text-white text-sm font-medium">Notificações</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-red-500/10 transition-colors"
            >
              <RotateCcw className="w-5 h-5 text-red-400" />
              <span className="text-red-400 text-sm font-medium">Restaurar Dados</span>
            </button>
          </div>
        </Card>

        {/* ─── FORMULÁRIO DE EDIÇÃO (inline, quando editing=true) ─── */}
        {editing && (
          <Card className={`${cardBg} p-5`}>
            <h3 className="text-white font-bold mb-4">Editar Dados</h3>
            {success && (
              <div className="mb-4 p-3 rounded-xl bg-green-500/20 text-green-400 text-sm">
                ✓ Perfil atualizado com sucesso!
              </div>
            )}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[#CEEDB2] text-xs">Altura (cm)</Label>
                  <Input type="number" value={formData.height || ""} onChange={e => setFormData({ ...formData, height: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white h-10" />
                </div>
                <div>
                  <Label className="text-[#CEEDB2] text-xs">Idade</Label>
                  <Input type="number" value={formData.age || ""} onChange={e => setFormData({ ...formData, age: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white h-10" />
                </div>
                <div>
                  <Label className="text-[#CEEDB2] text-xs">Peso Atual (kg)</Label>
                  <Input type="number" step="0.1" value={formData.current_weight || ""} onChange={e => setFormData({ ...formData, current_weight: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white h-10" />
                </div>
                <div>
                  <Label className="text-[#CEEDB2] text-xs">Peso Meta (kg)</Label>
                  <Input type="number" step="0.1" value={formData.target_weight || ""} onChange={e => setFormData({ ...formData, target_weight: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white h-10" />
                </div>
              </div>

              <div>
                <Label className="text-[#CEEDB2] text-xs">Objetivo</Label>
                <Select value={formData.goal} onValueChange={v => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#CEEDB2] text-xs">Nível de Atividade</Label>
                <Select value={formData.activity_level} onValueChange={v => setFormData({ ...formData, activity_level: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve (1–3x/sem)</SelectItem>
                    <SelectItem value="moderate">Moderado (3–5x/sem)</SelectItem>
                    <SelectItem value="active">Ativo (6–7x/sem)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (2x/dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#CEEDB2] text-xs">Biotipo</Label>
                <Select value={formData.body_type} onValueChange={v => setFormData({ ...formData, body_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorph">Ectomorfo (Metabolismo Rápido)</SelectItem>
                    <SelectItem value="mesomorph">Mesomorfo (Equilibrado)</SelectItem>
                    <SelectItem value="endomorph">Endomorfo (Ganha Peso Fácil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => saveProfileMutation.mutate(formData)} disabled={saveProfileMutation.isPending} className="flex-1 h-11 bg-[#CEF17B] hover:bg-[#b8d965] text-[#084734] font-bold">
                  {saveProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="h-11 border-white/10 text-white hover:bg-white/10">
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Assinatura */}
        {subscription && (
          <Card className={`${cardBg} p-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-[#CEF17B]" />
                <span className="text-white text-sm font-semibold">
                  {subscription.plan === "premium" ? "Plano Premium" : "Teste Grátis"}
                </span>
              </div>
              <Link to={createPageUrl("Subscription")}>
                <Button size="sm" variant="outline" className="border-[#CEF17B]/30 text-[#CEF17B] hover:bg-[#CEF17B]/10 text-xs h-8">
                  Gerenciar
                </Button>
              </Link>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}