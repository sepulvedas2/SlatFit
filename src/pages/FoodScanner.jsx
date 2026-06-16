import React, { useState, useRef, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import * as ai from "@/api/ai";
import { db } from "@/components/supabaseApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Edit, BarChart3, ScanLine, Camera, Pencil, Star, Droplets, Flame, ChevronRight } from "lucide-react";
import { format, startOfWeek, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import CameraCapture from "../components/scanner/CameraCapture";
import AnalyzingLoader from "../components/scanner/AnalyzingLoader";
import ScannerResultScreen from "../components/scanner/ScannerResultScreen";
import DailyTimeline from "../components/scanner/DailyTimeline";
import MealTypeSelector from "../components/scanner/MealTypeSelector";
import WeeklyView from "../components/scanner/WeeklyView";

function computeStreak(foodsByDate) {
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const dateStr = format(subDays(cursor, i), "yyyy-MM-dd");
    if (foodsByDate[dateStr] && foodsByDate[dateStr].length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export default function FoodScanner() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState("home"); // home | camera | analyzing | result | manual
  const [activeTab, setActiveTab] = useState("day"); // day | week
  const [imagePreview, setImagePreview] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("lunch");
  const [selectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState(null);
  const [manualData, setManualData] = useState({ food_name: "", portion_size: "", calories: "", protein: "", carbs: "", fats: "" });
  const [saving, setSaving] = useState(false);

  const galleryInCameraRef = useRef(null);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await db.UserProfile.filter({ id: u.id });
      setUserProfile(profiles[0] || null);
    }).catch(() => {});
  }, []);

  // Buscar registros da semana inteira
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: weekFoods = [] } = useQuery({
    queryKey: ["weekFoods", user?.id, weekStart],
    queryFn: () => db.FoodLog.filter({ user_id: user.id }),
    enabled: !!user?.id,
    initialData: [],
  });

  // Agrupar por data
  const foodsByDate = useMemo(() => {
    return weekFoods.reduce((acc, f) => {
      const d = f.log_date || today;
      if (!acc[d]) acc[d] = [];
      acc[d].push(f);
      return acc;
    }, {});
  }, [weekFoods, today]);

  const streak = useMemo(() => computeStreak(foodsByDate), [foodsByDate]);
  const todayFoods = foodsByDate[today] || [];
  const calorieTarget = userProfile?.daily_calorie_target || 2000;

  const handleFileSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError(null);
    setView("analyzing");
    analyzeFood(file);
  };

  const analyzeFood = async (file) => {
    setError(null);
    try {
      const { file_url } = await ai.uploadFile(file);
      const result = await ai.analyzeFoodImage(file_url);
      setNutritionData({ ...result, image_url: file_url });
      setView("result");
    } catch {
      setError("Erro ao analisar a imagem. Tente novamente ou use inserção manual.");
      setView("home");
    }
  };

  const saveFood = async (data) => {
    if (!user) return;
    await db.FoodLog.create({
      user_id: user.id,
      food_name: data.food_name,
      meal_type: selectedMealType,
      calories: parseFloat(data.calories) || 0,
      protein: parseFloat(data.protein) || 0,
      carbs: parseFloat(data.carbs) || 0,
      fats: parseFloat(data.fats) || 0,
      portion_size: data.portion_size || "",
      image_url: data.image_url || null,
      log_date: today,
    });
    queryClient.invalidateQueries(["weekFoods"]);
    queryClient.invalidateQueries(["todayFoods"]);
  };

  const handleSaveAndReset = async (data) => {
    await saveFood(data);
    setView("home");
    setNutritionData(null);
    setImagePreview(null);
  };

  const handleManualSave = async () => {
    if (!manualData.food_name || !manualData.calories) {
      setError("Preencha pelo menos nome e calorias.");
      return;
    }
    setSaving(true);
    await saveFood({
      food_name: manualData.food_name,
      portion_size: manualData.portion_size || "Não especificado",
      calories: manualData.calories,
      protein: manualData.protein || 0,
      carbs: manualData.carbs || 0,
      fats: manualData.fats || 0,
    });
    setManualData({ food_name: "", portion_size: "", calories: "", protein: "", carbs: "", fats: "" });
    setView("home");
    setSaving(false);
  };

  const reset = () => {
    setView("home");
    setNutritionData(null);
    setImagePreview(null);
    setError(null);
  };

  const mealTypeLabel = { breakfast: "Café da manhã", lunch: "Almoço", dinner: "Jantar", snack: "Lanche" }[selectedMealType];

  // Format date header
  const dateHeader = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const dateCapitalized = dateHeader.charAt(0).toUpperCase() + dateHeader.slice(1);

  const calTarget = userProfile?.daily_calorie_target || 2000;
  const protTarget = userProfile?.protein_target || 120;
  const carbsTarget = userProfile?.carbs_target || 250;
  const fatsTarget = userProfile?.fats_target || 65;
  const waterTarget = 2000;

  const dayCalories = todayFoods.reduce((s, f) => s + (f.calories || 0), 0);
  const dayProtein = todayFoods.reduce((s, f) => s + (f.protein || 0), 0);
  const dayCarbs = todayFoods.reduce((s, f) => s + (f.carbs || 0), 0);
  const dayFats = todayFoods.reduce((s, f) => s + (f.fats || 0), 0);

  return (
    <div className="min-h-screen pb-28">
      <div className="max-w-lg mx-auto px-4 space-y-4 pt-6">

        {error && (
          <div className="p-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* HOME — visão principal */}
          {view === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-5">

              {/* HEADER */}
              <div>
                <h1 className="text-2xl font-black text-white">Scanner Inteligente</h1>
                <p className="text-sm text-white/50 mt-0.5">{dateCapitalized}</p>
              </div>

              {/* METAS NUTRICIONAIS DO DIA */}
              <div className="rounded-3xl p-5 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-white">Metas do Dia</h2>
                  <span className="text-xs text-white/40">{Math.round(dayCalories)} / {calTarget} kcal</span>
                </div>

                {/* Calorie ring */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                      <circle
                        cx="40" cy="40" r="32" fill="none"
                        stroke="#f97316" strokeWidth="8"
                        strokeDasharray={`${2 * Math.PI * 32}`}
                        strokeDashoffset={`${2 * Math.PI * 32 * (1 - Math.min(dayCalories / calTarget, 1))}`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 0.8s ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-white">{Math.round((dayCalories / calTarget) * 100)}%</span>
                      <span className="text-[9px] text-white/40">calorias</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[
                      { label: "🥩 Proteína", consumed: dayProtein, target: protTarget, unit: "g", color: "#4ade80" },
                      { label: "🍞 Carboidr.", consumed: dayCarbs, target: carbsTarget, unit: "g", color: "#facc15" },
                      { label: "🥑 Gorduras", consumed: dayFats, target: fatsTarget, unit: "g", color: "#60a5fa" },
                    ].map(({ label, consumed, target, unit, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white/60">{label}</span>
                          <span className="text-white/80 font-semibold">{Math.round(consumed)}/{target}{unit}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((consumed / (target || 1)) * 100, 100)}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTÕES DE AÇÃO PRINCIPAL */}
              <div className="space-y-3">
                <button
                  onClick={() => setView("camera")}
                  className="w-full h-16 rounded-2xl font-bold text-lg text-[#084734] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
                >
                  <Camera className="w-6 h-6" />
                  Escanear Alimento com IA
                </button>

                <button
                  onClick={() => setView("manual")}
                  className="w-full h-13 py-4 rounded-2xl font-semibold text-sm text-white active:scale-95 transition-all flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <Pencil className="w-4 h-4 text-white/60" />
                  Inserir manualmente
                </button>
              </div>

              {/* Tabs dia / semana */}
              <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                {[
                  { key: "day", label: "📋 Hoje" },
                  { key: "week", label: "📊 Semana" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: activeTab === key ? "rgba(206,241,123,0.15)" : "transparent",
                      color: activeTab === key ? "#CEF17B" : "rgba(255,255,255,0.5)",
                      border: activeTab === key ? "1px solid rgba(206,241,123,0.3)" : "1px solid transparent",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "day" && (
                <div className="space-y-4">
                  <DailyTimeline foods={todayFoods} />
                  {todayFoods.length === 0 && (
                    <div className="py-10 text-center text-white/30 text-sm space-y-2">
                      <div className="text-4xl">🍽️</div>
                      <p>Nenhuma refeição registrada hoje.</p>
                      <p className="text-xs text-white/20">Escaneie ou insira manualmente para começar.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "week" && (
                <WeeklyView foodsByDate={foodsByDate} calorieTarget={calorieTarget} />
              )}
            </motion.div>
          )}

          {/* CAMERA */}
          {view === "camera" && (
            <motion.div key="camera" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <CameraCapture
                onCapture={(file) => {
                  const r = new FileReader();
                  r.onloadend = () => setImagePreview(r.result);
                  r.readAsDataURL(file);
                  setView("analyzing");
                  analyzeFood(file);
                }}
                onClose={() => setView("home")}
                fileInputRef={galleryInCameraRef}
                onGallery={handleFileSelect}
              />
            </motion.div>
          )}

          {/* ANALYZING */}
          {view === "analyzing" && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AnalyzingLoader imagePreview={imagePreview} />
            </motion.div>
          )}

          {/* RESULT */}
          {view === "result" && nutritionData && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Meal type selector */}
              <MealTypeSelector selected={selectedMealType} onChange={setSelectedMealType} />
              <ScannerResultScreen
                data={nutritionData}
                imagePreview={imagePreview}
                userProfile={userProfile}
                mealType={mealTypeLabel}
                todayFoods={todayFoods}
                onSave={handleSaveAndReset}
                onReset={reset}
              />
            </motion.div>
          )}

          {/* MANUAL */}
          {view === "manual" && (
            <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-5 rounded-3xl space-y-4" style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-xl">Inserir Manualmente</h3>
                  <button onClick={reset} className="text-white/40 hover:text-white/80 text-sm">Cancelar</button>
                </div>

                <MealTypeSelector selected={selectedMealType} onChange={setSelectedMealType} />

                <div className="space-y-3">
                  <div>
                    <Label className="text-white/60 text-sm">Nome do alimento *</Label>
                    <Input placeholder="Ex: Arroz com feijão" value={manualData.food_name} onChange={e => setManualData({ ...manualData, food_name: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1 h-12 text-base" />
                  </div>
                  <div>
                    <Label className="text-white/60 text-sm">Porção</Label>
                    <Input placeholder="Ex: 1 prato médio (300g)" value={manualData.portion_size} onChange={e => setManualData({ ...manualData, portion_size: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1 h-12 text-base" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "calories", label: "Calorias (kcal) *", placeholder: "Ex: 350" },
                      { key: "protein", label: "Proteínas (g)", placeholder: "Ex: 25" },
                      { key: "carbs", label: "Carboidratos (g)", placeholder: "Ex: 40" },
                      { key: "fats", label: "Gorduras (g)", placeholder: "Ex: 10" }
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <Label className="text-white/60 text-sm">{label}</Label>
                        <Input type="number" step="0.1" placeholder={placeholder} value={manualData[key]} onChange={e => setManualData({ ...manualData, [key]: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1 h-12 text-base" />
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <Button
                  onClick={handleManualSave}
                  disabled={saving || !manualData.food_name || !manualData.calories}
                  className="w-full h-14 rounded-2xl font-bold text-[#084734] text-base"
                  style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
                >
                  {saving ? "Salvando..." : "Adicionar ao Diário"}
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}