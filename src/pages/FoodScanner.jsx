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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PremiumFeatureLock from "../components/dashboard/PremiumFeatureLock";
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

  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const subs = await base44.entities.Subscription.filter({ user_email: user.email });
      return subs[0] || null;
    },
    enabled: !!user?.email,
  });

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

  const isPremium = subscription?.plan === "premium" || subscription?.plan === "free_trial";
  const scanLimit = isPremium ? 999 : 5;
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
    if (!canScan) {
      setError(`Limite diário atingido (${scanLimit} scans). Assine Premium para scans ilimitados!`);
      return;
    }
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
    <div className="min-h-screen p-3 md:p-8 pb-24 bg-[#054D3B] dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-2xl mx-auto space-y-4">
        
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 bg-orange-500/20 border border-orange-500/30">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-white">Scanner Nutricional IA</span>
            {!isPremium && (
              <span className="text-xs text-orange-500">
                ({dailyScans}/{scanLimit})
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
            Scanner Nutricional IA
          </h1>
          <p className="text-sm md:text-lg px-2 text-white/70">
            Calorias precisas com IA + ajuste de porção
          </p>
          {isPremium && (
            <p className="text-xs md:text-sm mt-1 text-white/60">
              Identificação automática • Base TACO/USDA
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => setMode("scan")}
            className={`h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl transition-all ${
              mode === "scan" 
                ? "bg-orange-500 text-white shadow-lg hover:bg-orange-600" 
                : "bg-white text-[#0B6B54] border-2 border-[#0B6B54] hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
            }`}
          >
            <Camera className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Escanear com IA</span>
            <span className="md:hidden ml-1 text-xs">Escanear</span>
          </Button>
          <Button
            onClick={() => setMode("manual")}
            className={`h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl transition-all ${
              mode === "manual" 
                ? "bg-orange-500 text-white shadow-lg hover:bg-orange-600" 
                : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-gray-50 dark:bg-slate-700 dark:text-white dark:border-slate-600 dark:hover:bg-slate-600"
            }`}
          >
            <Edit className="w-4 h-4 md:w-5 md:h-5 md:mr-2" />
            <span className="hidden md:inline">Inserir Manualmente</span>
            <span className="md:hidden ml-1 text-xs">Manual</span>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isPremium && dailyScans >= scanLimit && mode === "scan" && (
          <PremiumFeatureLock featureName="Scanner Ilimitado" />
        )}

        {mode === "manual" && (
          <Card className="p-6 rounded-3xl glass-effect border-[#CEF17B]/20">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-white text-lg">Inserir Dados Manualmente</h3>
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

        {mode === "scan" && (isPremium || dailyScans < scanLimit) && (
          <>
            {!showCamera && !imagePreview && (
              <Card className="p-4 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-[#0B6B54] to-orange-500/30 border border-orange-500/20 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700/20">
                <div className="space-y-4 md:space-y-6">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="w-full h-32 md:h-40 text-lg md:text-xl font-bold rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-2 md:gap-3 shadow-xl active:scale-95 md:hover:scale-105 transition-all bg-orange-500 hover:bg-orange-600"
                  >
                    <Camera className="w-10 h-10 md:w-12 md:h-12" />
                    Abrir Câmera
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 md:px-4 text-sm md:text-base font-semibold bg-[#0B6B54] text-orange-500 dark:bg-slate-900 dark:text-orange-400">
                        OU
                      </span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 md:h-28 border-dashed border-2 rounded-2xl md:rounded-3xl bg-transparent active:scale-95 md:hover:scale-105 transition-all flex-col md:flex-row gap-2 border-orange-500 text-white hover:bg-white/5 dark:border-orange-400 dark:hover:bg-slate-800/50"
                  >
                    <Upload className="w-7 h-7 md:w-8 md:h-8 md:mr-3 text-orange-500 dark:text-orange-400" />
                    <span className="text-base md:text-lg font-semibold">Fazer Upload de Imagem</span>
                  </Button>

                  <div className="p-3 md:p-4 rounded-xl md:rounded-2xl flex items-start gap-2 md:gap-3 bg-orange-500/15 border border-orange-500/30 dark:bg-orange-600/20 dark:border-orange-600/30">
                    <div className="text-xl md:text-2xl flex-shrink-0">💡</div>
                    <div>
                      <p className="text-xs md:text-sm font-semibold text-white mb-1">Dica de Uso:</p>
                      <p className="text-xs text-white/80 dark:text-gray-300">
                        Para maior precisão, fotografe o alimento de cima, com boa iluminação.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {showCamera && (
              <Card className="overflow-hidden rounded-2xl md:rounded-3xl bg-[#0B6B54] border-2 border-orange-500 dark:bg-slate-900 dark:border-orange-400">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <div className="p-3 md:p-4 flex gap-2 md:gap-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 h-12 md:h-14 text-sm md:text-base font-semibold rounded-xl md:rounded-2xl bg-orange-500 hover:bg-orange-600"
                  >
                    <Camera className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                    Capturar
                  </Button>
                  <Button
                    onClick={() => setShowCamera(false)}
                    className="h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-white text-[#054D3B] hover:bg-gray-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </div>
              </Card>
            )}

            {imagePreview && (
              <Card className="overflow-hidden rounded-2xl md:rounded-3xl bg-[#0B6B54] border-2 border-orange-500/40 dark:bg-slate-900 dark:border-orange-400/40">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full aspect-video object-cover"
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