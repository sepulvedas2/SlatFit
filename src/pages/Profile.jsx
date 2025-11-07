
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Target, Activity, LogOut, Save, Loader2, Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import ThemeSelector from "../components/profile/ThemeSelector";

// Helper function to create page URLs. In a real app, this would likely be imported from a utility.
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Subscription":
      return "/subscription"; // Example path for the Subscription page
    case "BillingHistory":
      return "/billing-history"; // Example path for Billing History page
    default:
      return `/${pageName.toLowerCase()}`; // Generic fallback for other pages
  }
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  // NEW: Fetch subscription data
  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null; // Assuming a user has at most one active subscription
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
        goal: 'maintenance',
        activity_level: 'moderate',
        gender: 'male',
        age: 25,
        body_type: 'mesomorph', // NEW: Default body type
        daily_calorie_target: 2000,
        protein_target: 150,
        carbs_target: 200,
        fats_target: 60,
        theme_preference: 'default' // NEW: Initialize theme preference
      });
    }
  }, [profile, user]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (profile) {
        return base44.entities.UserProfile.update(profile.id, data);
      } else {
        return base44.entities.UserProfile.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Invalidate subscription query as well if profile save could affect it, or just for good measure.
      // queryClient.invalidateQueries({ queryKey: ['subscription'] });
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // NEW: Trigger theme change event
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: formData.theme_preference } 
      }));
    },
  });

  const handleSave = () => {
    saveProfileMutation.mutate(formData);
  };

  // NEW: Handle theme change and save
  const handleThemeChange = (themeId) => {
    const updatedData = { ...formData, theme_preference: themeId };
    setFormData(updatedData);
    // Directly mutate with the updated data, no need to wait for edit mode
    saveProfileMutation.mutate(updatedData);
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const goalLabels = {
    weight_loss: 'Emagrecimento',
    muscle_gain: 'Ganho de Massa',
    maintenance: 'Manutenção'
  };

  const activityLabels = {
    sedentary: 'Sedentário',
    light: 'Leve',
    moderate: 'Moderado',
    active: 'Ativo',
    very_active: 'Muito Ativo'
  };

  const bodyTypeLabels = {
    ectomorph: 'Ectomorfo (Metabolismo Rápido)',
    mesomorph: 'Mesomorfo (Equilibrado)',
    endomorph: 'Endomorfo (Ganha Peso Fácil)'
  };

  // NEW: Determine if the user is premium or on trial
  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          {/* Updated avatar styling */}
          <div className="w-24 h-24 mx-auto mb-4 rounded-full gradient-primary flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">{user?.full_name}</h1>
          <p className="text-white/70 mt-1">{user?.email}</p>
          
          {/* NEW: Premium/Trial Badge */}
          {isPremium && (
            <Link to={createPageUrl("Subscription")}>
              <Badge className="mt-2 bg-[#CEF17B]/20 text-[#CEF17B] border-[#CEF17B]/30 hover:bg-[#CEF17B]/30 transition-colors cursor-pointer">
                <Crown className="w-3 h-3 mr-1" />
                {subscription.plan === "premium" ? "Premium" : "Teste Grátis"}
              </Badge>
            </Link>
          )}
        </div>

        {success && (
          <Alert className="bg-green-500/20 border-green-500/30">
            <AlertDescription className="text-green-400">
              Perfil atualizado com sucesso!
            </AlertDescription>
          </Alert>
        )}

        {/* NEW: Theme Selector */}
        <ThemeSelector 
          currentTheme={formData.theme_preference || 'default'}
          onThemeChange={handleThemeChange}
          isPremium={isPremium}
        />

        {/* Stats Cards */}
        {profile && !editing && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.current_weight} kg</p>
                  <p className="text-xs text-gray-400">Peso Atual</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{profile.target_weight} kg</p>
                  <p className="text-xs text-gray-400">Meta</p>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{goalLabels[profile.goal]}</p>
                  <p className="text-xs text-gray-400">Objetivo</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Subscription Card */}
        {subscription && (
          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Minha Assinatura</h3>
              <Link to={createPageUrl("Subscription")}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
                >
                  Gerenciar
                </Button>
              </Link>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#CEEDB2]">Plano Atual:</span>
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                  {subscription.plan === "premium" ? "Premium" : "Teste Grátis"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[#CEEDB2]">Status:</span>
                <span className={`text-sm font-semibold ${
                  subscription.is_active ? "text-green-400" : "text-red-400"
                }`}>
                  {subscription.is_active ? "Ativo" : "Inativo"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#CEEDB2]">Vencimento:</span>
                <span className="text-white font-semibold">
                  {format(new Date(subscription.end_date), 'dd/MM/yyyy')}
                </span>
              </div>

              <div className="pt-3 border-t border-white/10">
                <Link to={createPageUrl("BillingHistory")}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 hover:bg-white/5"
                  >
                    Ver Histórico de Pagamentos
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Informações do Perfil</h2>
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                className="border-white/10"
              >
                Editar
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Altura (cm)</Label>
                <Input
                  type="number"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value)})}
                  disabled={!editing}
                  className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60"
                />
              </div>

              <div>
                <Label className="text-gray-300">Idade</Label>
                <Input
                  type="number"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  disabled={!editing}
                  className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60"
                />
              </div>

              <div>
                <Label className="text-gray-300">Peso Atual (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.current_weight || ''}
                  onChange={(e) => setFormData({...formData, current_weight: parseFloat(e.target.value)})}
                  disabled={!editing}
                  className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60"
                />
              </div>

              <div>
                <Label className="text-gray-300">Peso Meta (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.target_weight || ''}
                  onChange={(e) => setFormData({...formData, target_weight: parseFloat(e.target.value)})}
                  disabled={!editing}
                  className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60"
                />
              </div>

              <div>
                <Label className="text-gray-300">Gênero</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                  disabled={!editing}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Objetivo</Label>
                <Select
                  value={formData.goal}
                  onValueChange={(value) => setFormData({...formData, goal: value})}
                  disabled={!editing}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Emagrecimento</SelectItem>
                    <SelectItem value="muscle_gain">Ganho de Massa</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NEW: Body Type Selector */}
              <div className="md:col-span-2">
                <Label className="text-gray-300">🧬 Seu Biotipo Corporal</Label>
                <Select
                  value={formData.body_type}
                  onValueChange={(value) => setFormData({...formData, body_type: value})}
                  disabled={!editing}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorph">Ectomorfo (Metabolismo Rápido)</SelectItem>
                    <SelectItem value="mesomorph">Mesomorfo (Equilibrado)</SelectItem>
                    <SelectItem value="endomorph">Endomorfo (Ganha Peso Fácil)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 mt-2">
                  Seu biotipo ajuda a calcular sua meta de hidratação diária personalizada
                </p>
              </div>

              <div className="md:col-span-2">
                <Label className="text-gray-300">Nível de Atividade</Label>
                <Select
                  value={formData.activity_level}
                  onValueChange={(value) => setFormData({...formData, activity_level: value})}
                  disabled={!editing}
                >
                  <SelectTrigger className="bg-slate-800/50 border-white/10 text-white disabled:opacity-60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentário</SelectItem>
                    <SelectItem value="light">Leve (1-3 dias/semana)</SelectItem>
                    <SelectItem value="moderate">Moderado (3-5 dias/semana)</SelectItem>
                    <SelectItem value="active">Ativo (6-7 dias/semana)</SelectItem>
                    <SelectItem value="very_active">Muito Ativo (2x por dia)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saveProfileMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  {saveProfileMutation.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5 mr-2" />
                  )}
                  Salvar
                </Button>
                <Button
                  onClick={() => setEditing(false)}
                  variant="outline"
                  className="border-white/10"
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full glass-effect border-red-500/30 text-red-400 hover:bg-red-500/20"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sair da Conta
        </Button>

      </div>
    </div>
  );
}
