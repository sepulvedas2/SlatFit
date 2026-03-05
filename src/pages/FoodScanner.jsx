import React, { useState, useRef, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
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
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState(null);
  const [manualData, setManualData] = useState({ food_name: "", portion_size: "", calories: "", protein: "", carbs: "", fats: "" });
  const [saving, setSaving] = useState(false);

  const galleryInCameraRef = useRef(null);
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      setUserProfile(profiles[0] || null);
    }).catch(() => {});
  }, []);

  // Buscar registros da semana inteira
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: weekFoods = [] } = useQuery({
    queryKey: ["weekFoods", user?.email, weekStart],
    queryFn: () => base44.entities.FoodLog.filter({ user_email: user.email }),
    enabled: !!user?.email,
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
  const todayFoods = foodsByDate[selectedDate] || [];
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
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um nutricionista expert. Analise esta imagem de alimento com MÁXIMA PRECISÃO e retorne informações nutricionais REAIS baseadas em bases de dados científicas (USDA, TACO Brasil).

Identifique:
1. Nome EXATO do alimento (em português, completo)
2. Tamanho REAL estimado da porção
3. Valores nutricionais PRECISOS para ESTA porção:
   - Calorias (kcal)
   - Proteínas (g)
   - Carboidratos (g)
   - Gorduras (g)

REGRAS: Se houver múltiplos alimentos, some os valores totais. Use dados de tabelas nutricionais oficiais (USDA, TACO). NUNCA invente valores.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            food_name: { type: "string" },
            portion_size: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fats: { type: "number" }
          }
        }
      });
      setNutritionData({ ...result, image_url: file_url });
      setView("result");
    } catch {
      setError("Erro ao analisar a imagem. Tente novamente ou use inserção manual.");
      setView("home");
    }
  };

  const saveFood = async (data) => {
    if (!user) return;
    await base44.entities.FoodLog.create({
      user_email: user.email,
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

  return (
    <div className="min-h-screen pb-28 pt-6">
      <div className="max-w-lg mx-auto px-4 space-y-4">

        {error && (
          <div className="p-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* HOME — visão principal */}
          {view === "home" && (
            <motion.div key="home" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">

              {/* Calendário semanal */}
              <WeeklyCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                foodsByDate={foodsByDate}
                calorieTarget={calorieTarget}
                streak={streak}
              />

              {/* Tabs dia / semana */}
              <div className="flex gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                {[
                  { key: "day", label: "📋 Hoje", icon: ScanLine },
                  { key: "week", label: "📊 Semana", icon: BarChart3 },
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
                  {/* Insight inteligente */}
                  <SmartInsight foods={todayFoods} userProfile={userProfile} />

                  {/* Macros do dia */}
                  <DailyMacrosPanel foods={todayFoods} userProfile={userProfile} />

                  {/* Linha do tempo */}
                  <DailyTimeline foods={todayFoods} />

                  {/* Botão de escanear */}
                  <button
                    onClick={() => setView("camera")}
                    className="w-full h-16 rounded-2xl font-bold text-lg text-[#084734] shadow-xl active:scale-95 transition-all"
                    style={{ background: "linear-gradient(135deg, #CEF17B, #CEEDB2)" }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-2xl">📸</span>
                      Escanear Alimento
                    </div>
                  </button>

                  {/* Demo: ver tela de resultado */}
                  <button
                    onClick={() => {
                      setNutritionData({ food_name: "Arroz com Frango Grelhado", portion_size: "300g", calories: 420, protein: 38, carbs: 45, fats: 8, image_url: null });
                      setImagePreview(null);
                      setView("result");
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-colors"
                    style={{ background: "rgba(206,241,123,0.07)", border: "1px solid rgba(206,241,123,0.2)", color: "#CEF17B" }}
                  >
                    ✨ Ver prévia do novo resultado
                  </button>

                  <button
                    onClick={() => setView("manual")}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-white/60 hover:text-white/90 transition-colors"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    <Edit className="w-4 h-4" />
                    Inserir manualmente
                  </button>

                  <StreakBadges streak={streak} />
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