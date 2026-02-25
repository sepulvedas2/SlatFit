import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Sparkles, Loader2, Check, X, Edit, Calculator } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NutritionResults from "../components/scanner/NutritionResults";
import MealTypeSelector from "../components/scanner/MealTypeSelector";
import RecentScans from "../components/scanner/RecentScans";
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Badge } from "@/components/ui/badge";

export default function FoodScanner() {
  const [user, setUser] = useState(null);
  
  const urlParams = new URLSearchParams(window.location.search);
  const urlMode = urlParams.get('mode');
  
  const [mode, setMode] = useState(urlMode === "manual" ? "manual" : "scan");
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);
  const [dailyScans, setDailyScans] = useState(0);
  
  const [manualData, setManualData] = useState({
    food_name: "",
    portion_size: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: ""
  });
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (showCamera) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [showCamera]);

  const { data: todayFoods } = useQuery({
    queryKey: ['todayScans', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return base44.entities.FoodLog.filter({ 
        user_email: user.email, 
        log_date: today 
      });
    },
    enabled: !!user?.email,
    initialData: [],
  });

  useEffect(() => {
    if (todayFoods) {
      setDailyScans(todayFoods.length);
    }
  }, [todayFoods]);

  const scanLimit = 999;
  const canScan = dailyScans < scanLimit;

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Não foi possível acessar a câmera. Por favor, use o upload de arquivo.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `food-${Date.now()}.jpg`, { type: 'image/jpeg' });
      handleFileSelect(file);
      setShowCamera(false);
    }, 'image/jpeg', 0.9);
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError(null);
    setNutritionData(null);
  };

  const analyzeFood = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedImage });

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um nutricionista expert. Analise esta imagem de alimento com MÁXIMA PRECISÃO e retorne informações nutricionais REAIS baseadas em bases de dados científicas (USDA, TACO Brasil).

IMPORTANTE: Seja extremamente preciso. Use referências visuais para estimar o tamanho real da porção.

Identifique:
1. Nome EXATO do alimento (em português, completo)
2. Tamanho REAL estimado da porção (ex: "1 prato médio (250g)", "1 banana média (118g)", "200ml")
3. Valores nutricionais PRECISOS para ESTA porção específica:
   - Calorias (kcal) - baseado em tabelas nutricionais reais
   - Proteínas (g) - valor preciso, não arredondado
   - Carboidratos (g) - valor preciso, não arredondado  
   - Gorduras (g) - valor preciso, não arredondado

REGRAS CRÍTICAS:
- Se houver múltiplos alimentos, identifique CADA UM e SOME os valores totais
- Use dados de tabelas nutricionais oficiais (USDA, TACO)
- Seja conservador na estimativa de porção (melhor subestimar que superestimar)
- Se não conseguir identificar com 95% de certeza, informe "Não identificado" no food_name
- NUNCA invente valores - use dados reais de bases científicas`,
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
    } catch (err) {
      setError("Erro ao analisar a imagem. Tente novamente ou use a inserção manual.");
      console.error(err);
    }

    setAnalyzing(false);
  };

  const saveFood = async (data) => {
    if (!user) return;

    setSaving(true);
    try {
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
        log_date: new Date().toISOString().split('T')[0]
      });

      queryClient.invalidateQueries(['todayScans']);
      queryClient.invalidateQueries(['todayFoods']);

      setSelectedImage(null);
      setImagePreview(null);
      setNutritionData(null);
      setManualData({
        food_name: "",
        portion_size: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: ""
      });
      setError(null);
      setMode("scan");
      
      setError(null);
    } catch (err) {
      setError("Erro ao salvar o alimento. Tente novamente.");
    }
    setSaving(false);
  };

  const handleManualSave = () => {
    if (!manualData.food_name || !manualData.calories) {
      setError("Por favor, preencha pelo menos o nome do alimento e as calorias.");
      return;
    }

    saveFood({
      food_name: manualData.food_name,
      portion_size: manualData.portion_size || "Não especificado",
      calories: parseFloat(manualData.calories) || 0,
      protein: parseFloat(manualData.protein) || 0,
      carbs: parseFloat(manualData.carbs) || 0,
      fats: parseFloat(manualData.fats) || 0
    });
  };

  const reset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNutritionData(null);
    setError(null);
    setMode("scan");
  };

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-5">
        
        {/* 1️⃣ HEADER DA TELA */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-3 glass-effect border border-[#CEF17B]/30">
            <Sparkles className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-xs font-bold text-white">IA ATIVA</span>
            <span className="text-xs text-white/60">•</span>
            <span className="text-xs text-white/80">BASE TACO/USDA</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Scanner Nutricional IA
          </h1>
          
          <p className="text-sm text-[#CEEDB2] mb-1">
            Calorias precisas com IA e ajuste de porção
          </p>


        </div>

        {/* 2️⃣ BOTÕES DE AÇÃO (CTA) */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setMode("scan")}
            className={`h-14 font-semibold rounded-2xl transition-all shadow-lg ${
              mode === "scan" 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white scale-[1.02]" 
                : "glass-effect border-[#CEF17B]/20 text-white hover:bg-white/10"
            }`}
          >
            <Camera className="w-5 h-5 mr-2" />
            Escanear Alimento
          </Button>
          <Button
            onClick={() => setMode("manual")}
            className={`h-14 font-semibold rounded-2xl transition-all ${
              mode === "manual" 
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white scale-[1.02] shadow-lg" 
                : "glass-effect border-[#CEF17B]/20 text-white/80 hover:bg-white/10"
            }`}
          >
            <Edit className="w-5 h-5 mr-2" />
            Inserir Manualmente
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {mode === "manual" && (
          <Card className="p-6 rounded-3xl glass-effect border-[#CEF17B]/20">
            <div className="space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Inserir Manualmente</h3>
                  <p className="text-xs text-white/60">Preencha os dados nutricionais</p>
                </div>
              </div>

              <MealTypeSelector 
                selected={selectedMealType}
                onChange={setSelectedMealType}
              />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-gray-300 dark:text-gray-400">Nome do Alimento *</Label>
                  <Input
                    placeholder="Ex: Arroz com feijão"
                    value={manualData.food_name}
                    onChange={(e) => setManualData({...manualData, food_name: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 dark:text-gray-400">Quantidade/Porção</Label>
                  <Input
                    placeholder="Ex: 1 prato médio (300g)"
                    value={manualData.portion_size}
                    onChange={(e) => setManualData({...manualData, portion_size: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300 dark:text-gray-400">Calorias (kcal) *</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={manualData.calories}
                      onChange={(e) => setManualData({...manualData, calories: e.target.value})}
                      className="bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 dark:text-gray-400">Proteínas (g)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={manualData.protein}
                      onChange={(e) => setManualData({...manualData, protein: e.target.value})}
                      className="bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 dark:text-gray-400">Carboidratos (g)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={manualData.carbs}
                      onChange={(e) => setManualData({...manualData, carbs: e.target.value})}
                      className="bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 dark:text-gray-400">Gorduras (g)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="0"
                      value={manualData.fats}
                      onChange={(e) => setManualData({...manualData, fats: e.target.value})}
                      className="bg-slate-800/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleManualSave}
                  disabled={saving || !manualData.food_name || !manualData.calories}
                  className="w-full h-14 text-base font-semibold rounded-2xl bg-orange-500 hover:bg-orange-600"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Salvar no Diário
                    </>
                  )}
                </Button>
                <p className="text-xs text-center mt-2 text-white/60">
                  * Campos obrigatórios
                </p>
              </div>
            </div>
          </Card>
        )}

        {mode === "scan" && (
          <>
            {!showCamera && !imagePreview && (
              <>
                {/* 3️⃣ ÁREA DE CÂMERA */}
                <Card className="glass-effect border-[#CEF17B]/20 p-8 rounded-3xl hover:scale-[1.01] transition-all">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="w-full h-40 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl flex flex-col items-center justify-center gap-4 shadow-xl hover:shadow-2xl transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Camera className="w-9 h-9" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold">Abrir Câmera</p>
                      <p className="text-sm text-white/80 mt-1">Escaneie o alimento em tempo real</p>
                    </div>
                  </Button>
                </Card>

                {/* 4️⃣ OPÇÃO DE UPLOAD DE IMAGEM */}
                <Card className="glass-effect border-[#CEF17B]/20 p-6 rounded-2xl cursor-pointer hover:bg-white/5 transition-all">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <Upload className="w-10 h-10 text-[#CEF17B]" />
                    <p className="text-white font-semibold">Selecionar imagem da galeria</p>
                    <p className="text-xs text-white/60">Ou arraste e solte aqui</p>
                  </div>
                </Card>

                {/* 5️⃣ HISTÓRICO RECENTE */}
                <RecentScans recentFoods={todayFoods} />

                {/* 6️⃣ DICA DE USO */}
                <Card className="glass-effect border-[#CEF17B]/20 p-4 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        Para maior precisão, fotografe o alimento de cima, com boa iluminação.
                      </p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {showCamera && (
              <Card className="overflow-hidden rounded-3xl glass-effect border-[#CEF17B]/20">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover bg-black"
                />
                <div className="p-4 flex gap-3 bg-gradient-to-t from-black/50 to-transparent">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 h-14 font-semibold rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capturar Foto
                  </Button>
                  <Button
                    onClick={() => setShowCamera(false)}
                    className="h-14 px-6 rounded-2xl glass-effect border-[#CEF17B]/20 text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            )}

            {imagePreview && (
              <Card className="overflow-hidden rounded-3xl glass-effect border-[#CEF17B]/20">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full aspect-video object-cover bg-black"
                />
                
                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  {!nutritionData && !analyzing && (
                    <>
                      <MealTypeSelector 
                        selected={selectedMealType}
                        onChange={setSelectedMealType}
                      />
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                        <Button
                          onClick={analyzeFood}
                          className="flex-1 h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl shadow-lg active:scale-95 md:hover:scale-105 transition-all bg-orange-500 hover:bg-orange-600"
                        >
                          <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Analisar com IA
                        </Button>
                        <Button
                          onClick={reset}
                          className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-white border-2 border-orange-500 text-orange-500 hover:bg-gray-50 dark:bg-slate-700 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-slate-600"
                        >
                          Nova Foto
                        </Button>
                      </div>
                    </>
                  )}

                  {analyzing && (
                    <div className="flex flex-col items-center justify-center py-8 md:py-12 space-y-3 md:space-y-4">
                      <Loader2 className="w-12 h-12 md:w-16 md:h-16 animate-spin text-orange-500" />
                      <p className="text-white font-semibold text-base md:text-lg">Analisando com IA...</p>
                      <p className="text-xs md:text-sm text-white/70">Consultando base TACO/USDA</p>
                    </div>
                  )}

                  {nutritionData && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs bg-orange-500/20 text-orange-500 border border-orange-500">
                          <Check className="w-3 h-3 mr-1" />
                          Análise Completa
                        </Badge>
                      </div>
                      <NutritionResults data={nutritionData} />
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4">
                        <Button
                          onClick={() => saveFood(nutritionData)}
                          disabled={saving}
                          className="flex-1 h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl bg-orange-500 hover:bg-orange-600"
                        >
                          {saving ? (
                            <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          )}
                          Adicionar
                        </Button>
                        <Button
                          onClick={reset}
                          className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-white border-2 border-[#0B6B54] text-[#0B6B54] hover:bg-gray-50 dark:bg-slate-700 dark:border-[#CEF17B]/20 dark:text-[#CEF17B] dark:hover:bg-slate-600"
                        >
                          Outro
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}