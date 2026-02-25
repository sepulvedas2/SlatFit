import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  User, Target, Activity, Save, Loader2, Crown,
  Droplets, Flame, Dumbbell, RefreshCw, Bell, Pencil, Moon, Sun, Scale, ArrowRight, TrendingUp
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

const GOAL_META = {
  weight_loss:  { label: "Emagrecimento",   emoji: "🔥", phrase: "Cada treino te aproxima da melhor versão de você!", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  muscle_gain:  { label: "Ganho de Massa",  emoji: "💪", phrase: "Músculo se constrói com consistência. Continue!", color: "bg-[#CEF17B]/20 text-[#CEF17B] border-[#CEF17B]/30" },
  maintenance:  { label: "Manutenção",      emoji: "⚖️", phrase: "Manter é também evoluir. Você está no caminho!", color: "bg-blue-400/20 text-blue-300 border-blue-400/30" },
};

const ACTIVITY_LABELS = {
  sedentary: "Sedentário", light: "Leve", moderate: "Moderado", active: "Ativo", very_active: "Muito Ativo"
};

const WATER_BY_BIOTYPE = { ectomorph: 2200, mesomorph: 2500, endomorph: 3000 };

function calcIMC(weight, height) {
  if (!weight || !height) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
}

function imcLabel(imc) {
  if (!imc) return "";
  const v = parseFloat(imc);
  if (v < 18.5) return "Abaixo do peso";
  if (v < 25) return "Normal";
  if (v < 30) return "Sobrepeso";
  return "Obesidade";
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
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: progressPhotos = [] } = useQuery({
    queryKey: ['progressPhotos', user?.email],
    queryFn: () => base44.entities.ProgressPhoto.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    } else if (user) {
      setFormData({
        user_email: user.email,
        height: 170, current_weight: 70, target_weight: 70,
        goal: 'maintenance', activity_level: 'moderate',
        gender: 'male', age: 25, body_type: 'mesomorph',
        daily_calorie_target: 2000, protein_target: 150,
        carbs_target: 200, fats_target: 60
      });
    }
  }, [profile, user]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) return base44.entities.UserProfile.update(profile.id, data);
      return base44.entities.UserProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const goalMeta = GOAL_META[formData.goal] || GOAL_META.maintenance;
  const imc = calcIMC(formData.current_weight, formData.height);
  const diff = formData.target_weight && formData.current_weight
    ? (formData.target_weight - formData.current_weight).toFixed(1)
    : null;
  const waterGoal = WATER_BY_BIOTYPE[formData.body_type] || 2500;

  const startWeight = progressPhotos.length > 0
    ? (progressPhotos.sort((a, b) => a.photo_date > b.photo_date ? 1 : -1)[0]?.weight || formData.current_weight)
    : formData.current_weight;

  const totalChange = Math.abs((formData.target_weight || 0) - (startWeight || 0));
  const currentChange = Math.abs((formData.current_weight || 0) - (startWeight || 0));
  const progressPercent = totalChange > 0 ? Math.min(100, Math.round((currentChange / totalChange) * 100)) : 0;

  const chartData = progressPhotos.length > 1
    ? progressPhotos
        .filter(p => p.weight)
        .sort((a, b) => a.photo_date > b.photo_date ? 1 : -1)
        .slice(-8)
        .map(p => ({ date: format(new Date(p.photo_date), 'dd/MM'), peso: p.weight }))
    : [
        { date: "Início", peso: formData.current_weight || 70 },
        { date: "Hoje", peso: formData.current_weight || 70 },
      ];

  const cardStyle = isDark
    ? { backgroundColor: "#162A28", border: "1px solid rgba(206,241,123,0.15)" }
    : {};

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja restaurar o perfil para os dados padrão?")) {
      setFormData({
        user_email: user?.email,
        height: 170, current_weight: 70, target_weight: 70,
        goal: 'maintenance', activity_level: 'moderate',
        gender: 'male', age: 25, body_type: 'mesomorph',
        daily_calorie_target: 2000, protein_target: 150,
        carbs_target: 200, fats_target: 60
      });
      setEditing(true);
    }
  };

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: isDark ? "#0F1C1B" : undefined, transition: "background-color 0.2s ease" }}>
      <div className="max-w-lg mx-auto px-4 pt-8 space-y-5">

        {/* BLOCO 1 — HEADER PREMIUM */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#CEF17B]/40 to-[#084734] flex items-center justify-center ring-4 ring-[#CEF17B]/30 mx-auto">
              <User className="w-12 h-12 text-[#CEF17B]" />
            </div>
            {isPremium && (
              <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{user?.full_name || "Meu Perfil"}</h1>

          <Badge className={`mt-3 ${goalMeta.color} border text-sm px-3 py-1`}>
            {goalMeta.emoji} {goalMeta.label}
          </Badge>
          <p className="text-[#CEEDB2] text-xs mt-3 italic max-w-xs mx-auto">"{goalMeta.phrase}"</p>
        </motion.div>

        {success && (
          <Alert className="bg-green-500/20 border-green-500/30">
            <AlertDescription className="text-green-400">Perfil atualizado com sucesso! ✓</AlertDescription>
          </Alert>
        )}

        {/* BLOCO 2 — RESUMO FÍSICO (GRID 2x2) */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-white font-bold mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#CEF17B]" /> Resumo Físico
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Peso Atual", value: `${formData.current_weight || "—"} kg`, icon: <Activity className="w-5 h-5 text-blue-400" />, sub: "Registrado" },
              { label: "Peso Meta", value: `${formData.target_weight || "—"} kg`, icon: <Target className="w-5 h-5 text-[#CEF17B]" />, sub: "Objetivo" },
              { label: "IMC", value: imc || "—", icon: <TrendingUp className="w-5 h-5 text-purple-400" />, sub: imcLabel(imc) },
              { label: "Diferença", value: diff !== null ? `${diff > 0 ? "+" : ""}${diff} kg` : "—", icon: <ArrowRight className="w-5 h-5 text-orange-400" />, sub: "Para a meta" },
            ].map((card, i) => (
              <div key={i} className="glass-effect rounded-2xl p-4" style={cardStyle}>
                <div className="flex items-center gap-2 mb-2">{card.icon}<span className="text-[#A0B5B2] text-xs">{card.label}</span></div>
                <p className="text-3xl font-black text-white leading-tight">{card.value}</p>
                <p className="text-[#A0B5B2] text-xs mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* BLOCO 3 — BARRA DE PROGRESSO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="glass-effect rounded-2xl p-5" style={cardStyle}>
            <h3 className="text-white font-bold mb-4 text-sm">Progresso até a Meta</h3>
            <div className="flex justify-between text-xs text-[#A0B5B2] mb-2">
              <span>{startWeight} kg</span>
              <span className="text-[#CEF17B] font-bold">{progressPercent}%</span>
              <span>{formData.target_weight} kg</span>
            </div>
            <Progress
              value={progressPercent}
              className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#CEF17B] [&>div]:to-green-400 [&>div]:transition-all [&>div]:duration-1000 rounded-full"
            />
            <p className="text-[#A0B5B2] text-xs mt-2 text-center">
              {Math.abs(diff || 0)} kg {parseFloat(diff) > 0 ? "para ganhar" : "para perder"}
            </p>
          </div>
        </motion.div>

        {/* BLOCO 4 — GRÁFICO DE EVOLUÇÃO */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass-effect rounded-2xl p-5" style={cardStyle}>
            <h3 className="text-white font-bold mb-4 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#CEF17B]" /> Evolução do Peso
            </h3>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A0B5B2" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#162A28", border: "1px solid rgba(206,241,123,0.2)", borderRadius: 8, color: "#fff", fontSize: 12 }}
                  formatter={(v) => [`${v} kg`, "Peso"]}
                />
                <Line type="monotone" dataKey="peso" stroke="#CEF17B" strokeWidth={2.5} dot={{ fill: "#CEF17B", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* BLOCO 5 — INDICADORES INTELIGENTES */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="glass-effect rounded-2xl p-5" style={cardStyle}>
            <h3 className="text-white font-bold mb-4 text-sm">Metas Diárias</h3>
            <div className="space-y-3">
              {[
                { icon: <Flame className="w-5 h-5 text-orange-400" />, label: "Calorias", value: `${formData.daily_calorie_target || 2000} kcal` },
                { icon: <Dumbbell className="w-5 h-5 text-[#CEF17B]" />, label: "Proteína", value: `${formData.protein_target || 150}g` },
                { icon: <Droplets className="w-5 h-5 text-blue-400" />, label: "Água", value: `${waterGoal}ml` },
                { icon: <Activity className="w-5 h-5 text-purple-400" />, label: "Atividade", value: ACTIVITY_LABELS[formData.activity_level] || "Moderado" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-[#A0B5B2] text-sm">{item.label}</span>
                  </div>
                  <span className="text-white font-bold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* BLOCO 6 — CONFIGURAÇÕES */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass-effect rounded-2xl p-5 space-y-1" style={cardStyle}>
            <h3 className="text-white font-bold mb-4 text-sm">Configurações</h3>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                {isDark ? <Moon className="w-5 h-5 text-[#CEF17B]" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                <div>
                  <p className="text-white text-sm font-medium">Modo Noturno</p>
                  <p className="text-[#A0B5B2] text-xs">{isDark ? "Ativado" : "Desativado"}</p>
                </div>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-[#CEF17B]"
              />
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center gap-3 py-3 text-left"
            >
              <Pencil className="w-5 h-5 text-[#A0B5B2]" />
              <span className="text-white text-sm">Editar Dados</span>
            </button>
          </div>
        </motion.div>

      </div>

      {/* MODAL DE EDIÇÃO */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: "rgba(0,0,0,0.7)" }}>
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }}
            className="w-full max-w-lg rounded-t-3xl p-6 overflow-y-auto max-h-[90vh]"
            style={{ backgroundColor: isDark ? "#162A28" : "#0a3d2b", border: "1px solid rgba(206,241,123,0.2)" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Editar Dados</h3>
              <button onClick={() => setEditing(false)} className="text-[#A0B5B2] text-2xl leading-none">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[#A0B5B2] text-xs">Altura (cm)</Label>
                  <Input type="number" value={formData.height || ''} onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})} className="bg-white/10 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-[#A0B5B2] text-xs">Idade</Label>
                  <Input type="number" value={formData.age || ''} onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})} className="bg-white/10 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-[#A0B5B2] text-xs">Peso Atual (kg)</Label>
                  <Input type="number" step="0.1" value={formData.current_weight || ''} onChange={(e) => setFormData({...formData, current_weight: parseFloat(e.target.value)})} className="bg-white/10 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-[#A0B5B2] text-xs">Peso Meta (kg)</Label>
                  <Input type="number" step="0.1" value={formData.target_weight || ''} onChange={(e) => setFormData({...formData, target_weight: parseFloat(e.target.value)})} className="bg-white/10 border-white/10 text-white" />
                </div>
              </div>

              <div>
                <Label className="text-[#A0B5B2] text-xs">Gênero</Label>
                <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                  <SelectTrigger className="bg-white/10 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#A0B5B2] text-xs">Objetivo</Label>
                <Select value={formData.goal} onValueChange={(v) => setFormData({...formData, goal: v})}>
                  <SelectTrigger className="bg-white/10 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#A0B5B2] text-xs">Biotipo</Label>
                <Select value={formData.body_type} onValueChange={(v) => setFormData({...formData, body_type: v})}>
                  <SelectTrigger className="bg-white/10 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorph">Ectomorfo</SelectItem>
                    <SelectItem value="mesomorph">Mesomorfo</SelectItem>
                    <SelectItem value="endomorph">Endomorfo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#A0B5B2] text-xs">Nível de Atividade</Label>
                <Select value={formData.activity_level} onValueChange={(v) => setFormData({...formData, activity_level: v})}>
                  <SelectTrigger className="bg-white/10 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve</SelectItem>
                    <SelectItem value="moderate">Moderado</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="very_active">Muito Ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => saveProfileMutation.mutate(formData)}
                  disabled={saveProfileMutation.isPending}
                  className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#b8e05a] font-bold h-12"
                >
                  {saveProfileMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Salvar</>}
                </Button>
                <Button onClick={() => setEditing(false)} variant="outline" className="border-white/20 text-white h-12">
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}