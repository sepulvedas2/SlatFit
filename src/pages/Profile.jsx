import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  User, Target, Activity, Save, Loader2, Crown, Droplets,
  Flame, Dumbbell, Moon, Sun, Bell, RefreshCw, Edit3, ChevronRight, Scale
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const goalLabels = {
  weight_loss: "Emagrecimento",
  muscle_gain: "Ganho de Massa",
  maintenance: "Manutenção",
};

const goalMotivation = {
  weight_loss: "Cada treino te aproxima da melhor versão de você 🔥",
  muscle_gain: "Músculo se constrói com consistência e dedicação 💪",
  maintenance: "Equilíbrio é a chave para uma vida saudável ⚖️",
};

const activityLabels = {
  sedentary: "Sedentário",
  light: "Leve",
  moderate: "Moderado",
  active: "Ativo",
  very_active: "Muito Ativo",
};

// Simulated weight evolution data (last 6 weeks)
function buildWeightChart(currentWeight) {
  const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5", "Agora"];
  return weeks.map((week, i) => ({
    week,
    peso: +(currentWeight - (5 - i) * 0.4 + (Math.random() * 0.3 - 0.15)).toFixed(1),
  }));
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    // Dispatch global event so Layout applies the theme everywhere
    window.dispatchEvent(new CustomEvent("app-dark-mode-change", { detail: { darkMode } }));
  }, [darkMode]);

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

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";

  // Calculations
  const heightM = (profile?.height || 170) / 100;
  const imc = profile?.current_weight
    ? (profile.current_weight / (heightM * heightM)).toFixed(1)
    : "--";
  const weightDiff = profile
    ? (profile.target_weight - profile.current_weight).toFixed(1)
    : "--";
  const weightProgress = profile
    ? Math.min(100, Math.max(0,
        profile.goal === "weight_loss"
          ? ((profile.current_weight - profile.target_weight) /
              (profile.current_weight - profile.target_weight + Math.abs(weightDiff))) * 100
          : ((profile.current_weight / profile.target_weight) * 100)
      ))
    : 0;

  const chartData = profile?.current_weight ? buildWeightChart(profile.current_weight) : [];

  const waterGoal = profile?.body_type === "endomorph" ? 3.5
    : profile?.body_type === "ectomorph" ? 2.5 : 3.0;

  return (
    <div className="min-h-screen pb-32" style={{ background: darkMode ? "#0F1C1B" : undefined }}>
      <style>{`
        .dark-mode-app { --dm-bg: #0F1C1B; --dm-card: #162A28; --dm-text: #FFFFFF; --dm-sub: #A0B5B2; }
      `}</style>

      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* ── BLOCO 1: HEADER ── */}
        <div className="text-center space-y-3 py-4">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-lg shadow-[#CEF17B]/20">
              <User className="w-12 h-12 text-white" />
            </div>
            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#CEF17B] rounded-full flex items-center justify-center">
                <Crown className="w-4 h-4 text-[#084734]" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white">{user?.full_name || "Atleta"}</h1>
            <p className="text-white/50 text-sm">{user?.email}</p>
          </div>

          {profile?.goal && (
            <div className="space-y-1">
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-[#CEF17B]/30 px-3 py-1">
                {goalLabels[profile.goal]}
              </Badge>
              <p className="text-white/60 text-sm italic">{goalMotivation[profile.goal]}</p>
            </div>
          )}
        </div>

        {/* ── BLOCO 2: GRID 2x2 FÍSICO ── */}
        {profile && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Peso Atual", value: `${profile.current_weight} kg`, icon: Scale, color: "#CEF17B" },
              { label: "Peso Meta", value: `${profile.target_weight} kg`, icon: Target, color: "#6EE7B7" },
              {
                label: "IMC",
                value: imc,
                sub: imc < 18.5 ? "Abaixo" : imc < 25 ? "Normal" : imc < 30 ? "Sobrepeso" : "Obesidade",
                icon: Activity,
                color: "#A78BFA",
              },
              {
                label: weightDiff > 0 ? "Faltam ganhar" : "Faltam perder",
                value: `${Math.abs(weightDiff)} kg`,
                icon: Dumbbell,
                color: "#FB923C",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <Card
                  key={card.label}
                  className="p-4 border-white/8"
                  style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white leading-tight">{card.value}</p>
                  {card.sub && <p className="text-xs mt-0.5" style={{ color: card.color }}>{card.sub}</p>}
                  <p className="text-xs text-white/40 mt-1">{card.label}</p>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── BLOCO 3: BARRA DE PROGRESSO ── */}
        {profile && (
          <Card
            className="p-5 border-white/8"
            style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
          >
            <p className="text-sm font-semibold text-white/70 mb-3">Progresso até a meta</p>
            <div className="flex justify-between text-xs text-white/50 mb-2">
              <span>{profile.current_weight} kg</span>
              <span>{profile.target_weight} kg</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(weightProgress, 100)}%`,
                  background: "linear-gradient(90deg, #CEF17B, #6EE7B7)",
                }}
              />
            </div>
            <p className="text-right text-xs text-[#CEF17B] mt-1 font-semibold">
              {Math.round(weightProgress)}% concluído
            </p>
          </Card>
        )}

        {/* ── BLOCO 4: GRÁFICO ── */}
        {profile?.current_weight && chartData.length > 0 && (
          <Card
            className="p-5 border-white/8"
            style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
          >
            <p className="text-sm font-semibold text-white/70 mb-4">Evolução de Peso</p>
            <ResponsiveContainer width="100%" height={90}>
              <LineChart data={chartData}>
                <XAxis dataKey="week" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#162A28", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v) => [`${v} kg`, "Peso"]}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#CEF17B"
                  strokeWidth={2.5}
                  dot={{ fill: "#CEF17B", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── BLOCO 5: INDICADORES ── */}
        {profile && (
          <Card
            className="p-5 border-white/8"
            style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
          >
            <p className="text-sm font-semibold text-white/70 mb-4">Metas Diárias</p>
            <div className="space-y-3">
              {[
                { icon: Flame, color: "#FB923C", label: "Calorias", value: `${profile.daily_calorie_target || 2000} kcal` },
                { icon: Dumbbell, color: "#A78BFA", label: "Proteína", value: `${profile.protein_target || 150} g` },
                { icon: Droplets, color: "#38BDF8", label: "Água", value: `${waterGoal} L` },
                { icon: Activity, color: "#6EE7B7", label: "Atividade", value: activityLabels[profile.activity_level] || "Moderado" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${item.color}20` }}>
                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                      </div>
                      <span className="text-sm text-white/60">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-white">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* ── BLOCO 6: CONFIGURAÇÕES ── */}
        <Card
          className="p-5 border-white/8"
          style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
        >
          <p className="text-sm font-semibold text-white/70 mb-4">Configurações</p>
          <div className="space-y-1">

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/20 flex items-center justify-center">
                  {darkMode ? <Sun className="w-4 h-4 text-[#A78BFA]" /> : <Moon className="w-4 h-4 text-[#A78BFA]" />}
                </div>
                <span className="text-sm text-white">{darkMode ? "Modo Claro" : "Modo Noturno"}</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-[#CEF17B]" : "bg-white/20"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? "left-6" : "left-1"}`} />
              </div>
            </button>

            {/* Notificações */}
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FB923C]/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#FB923C]" />
                </div>
                <span className="text-sm text-white">Notificações</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>

            {/* Editar Dados */}
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#6EE7B7]/20 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-[#6EE7B7]" />
                </div>
                <span className="text-sm text-white">Editar Dados</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>

            {/* Restaurar Perfil */}
            <button
              onClick={() => {
                if (window.confirm("Deseja restaurar os dados padrão do perfil?")) {
                  setFormData({ user_email: user?.email, goal: "maintenance", activity_level: "moderate", gender: "male", age: 25, height: 170, current_weight: 70, target_weight: 70, body_type: "mesomorph", daily_calorie_target: 2000, protein_target: 150 });
                  setEditing(true);
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-white/50" />
                </div>
                <span className="text-sm text-white/70">Restaurar Perfil</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30" />
            </button>
          </div>
        </Card>

        {/* ── FORMULÁRIO DE EDIÇÃO ── */}
        {editing && (
          <Card
            className="p-6 border-[#CEF17B]/20"
            style={{ background: darkMode ? "#162A28" : "rgba(206, 237, 178, 0.07)", backdropFilter: "blur(20px)" }}
          >
            <h2 className="text-lg font-bold text-white mb-5">Editar Perfil</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Altura (cm)</Label>
                  <Input type="number" value={formData.height || ""} onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Idade</Label>
                  <Input type="number" value={formData.age || ""} onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Peso Atual (kg)</Label>
                  <Input type="number" step="0.1" value={formData.current_weight || ""} onChange={(e) => setFormData({ ...formData, current_weight: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-white/60 text-xs mb-1 block">Peso Meta (kg)</Label>
                  <Input type="number" step="0.1" value={formData.target_weight || ""} onChange={(e) => setFormData({ ...formData, target_weight: parseFloat(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1 block">Gênero</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1 block">Objetivo</Label>
                <Select value={formData.goal} onValueChange={(v) => setFormData({ ...formData, goal: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1 block">Biotipo</Label>
                <Select value={formData.body_type} onValueChange={(v) => setFormData({ ...formData, body_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorph">Ectomorfo (Metabolismo Rápido)</SelectItem>
                    <SelectItem value="mesomorph">Mesomorfo (Equilibrado)</SelectItem>
                    <SelectItem value="endomorph">Endomorfo (Ganha Peso Fácil)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white/60 text-xs mb-1 block">Nível de Atividade</Label>
                <Select value={formData.activity_level} onValueChange={(v) => setFormData({ ...formData, activity_level: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve (1-3 dias/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (3-5 dias/semana)</SelectItem>
                    <SelectItem value="active">Ativo (6-7 dias/semana)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (2x por dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={() => saveProfileMutation.mutate(formData)} disabled={saveProfileMutation.isPending} className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 font-bold">
                  {saveProfileMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="border-white/10 text-white">
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {success && (
          <div className="text-center py-2">
            <span className="text-[#CEF17B] text-sm font-semibold">✓ Perfil atualizado!</span>
          </div>
        )}

      </div>
    </div>
  );
}