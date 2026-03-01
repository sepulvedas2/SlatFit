import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import ScannerHero from "../components/scanner/ScannerHero";
import CameraCapture from "../components/scanner/CameraCapture";
import AnalyzingLoader from "../components/scanner/AnalyzingLoader";
import NutritionResultsPremium from "../components/scanner/NutritionResultsPremium";
import DailyTimeline from "../components/scanner/DailyTimeline";
import MealTypeSelector from "../components/scanner/MealTypeSelector";

export default function FoodScanner() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [view, setView] = useState("hero"); // hero | camera | analyzing | result | manual
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [nutritionData, setNutritionData] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("lunch");
  const [error, setError] = useState(null);
  const [manualData, setManualData] = useState({ food_name: "", portion_size: "", calories: "", protein: "", carbs: "", fats: "" });
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const galleryInCameraRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(async (u) => {
      setUser(u);
      const profiles = await base44.entities.UserProfile.filter({ user_email: u.email });
      setUserProfile(profiles[0] || null);
    }).catch(() => {});
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const { data: todayFoods = [] } = useQuery({
    queryKey: ["todayScans", user?.email, today],
    queryFn: () => base44.entities.FoodLog.filter({ user_email: user.email, log_date: today }),
    enabled: !!user?.email,
    initialData: [],
  });

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedImage(file);
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

IMPORTANTE: Seja extremamente preciso. Use referências visuais para estimar o tamanho real da porção.

Identifique:
1. Nome EXATO do alimento (em português, completo)
2. Tamanho REAL estimado da porção (ex: "1 prato médio (250g)", "1 banana média (118g)", "200ml")
3. Valores nutricionais PRECISOS para ESTA porção específica:
   - Calorias (kcal) - baseado em tabelas nutricionais reais
   - Proteínas (g) - valor preciso
   - Carboidratos (g) - valor preciso
   - Gorduras (g) - valor preciso

REGRAS CRÍTICAS:
- Se houver múltiplos alimentos, identifique CADA UM e SOME os valores totais
- Use dados de tabelas nutricionais oficiais (USDA, TACO)
- Se não conseguir identificar com 95% de certeza, informe "Não identificado" no food_name
- NUNCA invente valores`,
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
      setError("Erro ao analisar. Tente novamente ou use inserção manual.");
      setView("hero");
    }
  };

  const saveFood = async (data) => {
    if (!user) return;
    setSaving(true);
    await base44.entities.FoodLog.create({
      user_email: user.email,
      food_name: data.food_name,
      meal_type: selectedMealType,
      calories: parseFloat(data.calories),
      protein: parseFloat(data.protein),
      carbs: parseFloat(data.carbs),
      fats: parseFloat(data.fats),
      portion_size: data.portion_size,
      image_url: data.image_url || null,
      log_date: today,
    });
    queryClient.invalidateQueries(["todayScans"]);
    queryClient.invalidateQueries(["todayFoods"]);
    setSaving(false);
  };

  const handleSaveAndReset = async (data) => {
    await saveFood(data);
    // short delay for animation, then go back to hero
    setTimeout(() => {
      setView("hero");
      setNutritionData(null);
      setImagePreview(null);
      setSelectedImage(null);
    }, 1200);
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
      calories: parseFloat(manualData.calories) || 0,
      protein: parseFloat(manualData.protein) || 0,
      carbs: parseFloat(manualData.carbs) || 0,
      fats: parseFloat(manualData.fats) || 0,
    });
    setManualData({ food_name: "", portion_size: "", calories: "", protein: "", carbs: "", fats: "" });
    setView("hero");
    setSaving(false);
  };

  const reset = () => {
    setView("hero");
    setNutritionData(null);
    setImagePreview(null);
    setSelectedImage(null);
    setError(null);
  };

  const mealTypeLabel = {
    breakfast: "Café da manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche",
  }[selectedMealType];

  return (
    <div className="min-h-screen pb-28 px-4 pt-8">
      <div className="max-w-lg mx-auto space-y-5">

        {error && (
          <div className="p-3 rounded-xl text-sm text-red-300" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)" }}>
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* HERO */}
          {view === "hero" && (
            <motion.div key="hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">
              <ScannerHero
                onScan={() => setView("camera")}
                onGallery={handleFileSelect}
                fileInputRef={fileInputRef}
              />

              {/* Manual entry button */}
              <button
                onClick={() => setView("manual")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm text-white/60 hover:text-white/90 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Edit className="w-4 h-4" />
                Inserir manualmente
              </button>

              {/* Daily Timeline */}
              <DailyTimeline foods={todayFoods} />
            </motion.div>
          )}

          {/* CAMERA */}
          {view === "camera" && (
            <motion.div key="camera" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <CameraCapture
                onCapture={(file) => { setView("analyzing"); setSelectedImage(file); const r = new FileReader(); r.onloadend = () => setImagePreview(r.result); r.readAsDataURL(file); analyzeFood(file); }}
                onClose={() => setView("hero")}
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
              {imagePreview && (
                <div className="relative overflow-hidden rounded-3xl">
                  <img src={imagePreview} alt="Food" className="w-full aspect-video object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(8,71,52,0.9))" }} />
                  <div className="absolute bottom-3 left-4">
                    <MealTypeSelector selected={selectedMealType} onChange={setSelectedMealType} />
                  </div>
                </div>
              )}
              <div className="p-4 rounded-3xl" style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}>
                <NutritionResultsPremium
                  data={nutritionData}
                  userProfile={userProfile}
                  mealType={mealTypeLabel}
                  onSave={handleSaveAndReset}
                  onReset={reset}
                />
              </div>
            </motion.div>
          )}

          {/* MANUAL */}
          {view === "manual" && (
            <motion.div key="manual" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="p-5 rounded-3xl space-y-4" style={{ background: "rgba(8,71,52,0.6)", backdropFilter: "blur(20px)", border: "1px solid rgba(206,241,123,0.15)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-lg">Inserir Manualmente</h3>
                  <button onClick={() => setView("hero")} className="text-white/40 hover:text-white/80 text-sm">Cancelar</button>
                </div>

                <MealTypeSelector selected={selectedMealType} onChange={setSelectedMealType} />

                <div className="space-y-3">
                  <div>
                    <Label className="text-white/60 text-xs">Nome do alimento *</Label>
                    <Input placeholder="Ex: Arroz com feijão" value={manualData.food_name} onChange={e => setManualData({ ...manualData, food_name: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div>
                    <Label className="text-white/60 text-xs">Porção</Label>
                    <Input placeholder="Ex: 1 prato médio (300g)" value={manualData.portion_size} onChange={e => setManualData({ ...manualData, portion_size: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ key: "calories", label: "Calorias (kcal) *" }, { key: "protein", label: "Proteínas (g)" }, { key: "carbs", label: "Carboidratos (g)" }, { key: "fats", label: "Gorduras (g)" }].map(({ key, label }) => (
                      <div key={key}>
                        <Label className="text-white/60 text-xs">{label}</Label>
                        <Input type="number" step="0.1" placeholder="0" value={manualData[key]} onChange={e => setManualData({ ...manualData, [key]: e.target.value })} className="bg-white/5 border-white/10 text-white mt-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleManualSave}
                  disabled={saving || !manualData.food_name || !manualData.calories}
                  className="w-full h-14 rounded-2xl font-bold text-[#084734]"
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