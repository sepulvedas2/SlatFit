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
  const [mode, setMode] = useState("scan"); // "scan" or "manual"
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);
  const [dailyScans, setDailyScans] = useState(0);
  
  // Manual entry state
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
- NUNCA invente valores - use dados reais de bases científicas

Exemplo de resposta precisa:
{
  "food_name": "Arroz branco cozido com feijão preto",
  "portion_size": "1 prato médio (300g arroz + 100g feijão)",
  "calories": 445,
  "protein": 13.2,
  "carbs": 82.5,
  "fats": 3.8
}`,
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

      // Invalidate queries to update dashboard
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
      
      // Show success message
      setError(null);
    } catch (err) {
      setError("Erro ao salvar o alimento. Tente novamente.");
    }
    setSaving(false);
  };

  const handleManualSave = () => {
    // Validate manual data
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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Scanner Nutricional IA</span>
            {!isPremium && (
              <span className="text-xs text-blue-400">
                ({dailyScans}/{scanLimit} hoje)
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Análise Nutricional
          </h1>
          <p className="text-gray-400 mt-2">
            {isPremium 
              ? "Precisão de 95%+ com IA avançada" 
              : `${Math.max(0, scanLimit - dailyScans)} scans restantes hoje`}
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <Button
            onClick={() => setMode("scan")}
            variant={mode === "scan" ? "default" : "outline"}
            className={`flex-1 ${mode === "scan" 
              ? "bg-gradient-to-r from-blue-600 to-cyan-600" 
              : "border-white/10 hover:bg-white/5"}`}
          >
            <Camera className="w-4 h-4 mr-2" />
            Escanear com IA
          </Button>
          <Button
            onClick={() => setMode("manual")}
            variant={mode === "manual" ? "default" : "outline"}
            className={`flex-1 ${mode === "manual" 
              ? "bg-gradient-to-r from-purple-600 to-pink-600" 
              : "border-white/10 hover:bg-white/5"}`}
          >
            <Edit className="w-4 h-4 mr-2" />
            Inserir Manual
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

        {/* Manual Entry Mode */}
        {mode === "manual" && (
          <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Inserir Dados Manualmente</h3>
              </div>

              <MealTypeSelector 
                selected={selectedMealType}
                onChange={setSelectedMealType}
              />

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-gray-300">Nome do Alimento *</Label>
                  <Input
                    placeholder="Ex: Arroz com feijão"
                    value={manualData.food_name}
                    onChange={(e) => setManualData({...manualData, food_name: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Quantidade/Porção</Label>
                  <Input
                    placeholder="Ex: 1 prato médio (300g)"
                    value={manualData.portion_size}
                    onChange={(e) => setManualData({...manualData, portion_size: e.target.value})}
                    className="bg-slate-800/50 border-white/10 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Calorias (kcal) *</Label>
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
                    <Label className="text-gray-300">Proteínas (g)</Label>
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
                    <Label className="text-gray-300">Carboidratos (g)</Label>
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
                    <Label className="text-gray-300">Gorduras (g)</Label>
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
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
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
                <p className="text-xs text-gray-400 text-center mt-2">
                  * Campos obrigatórios
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Scan Mode */}
        {mode === "scan" && (isPremium || dailyScans < scanLimit) && (
          <>
            {!showCamera && !imagePreview && (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 p-8">
                <div className="space-y-4">
                  <Button
                    onClick={() => setShowCamera(true)}
                    className="w-full h-32 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg font-semibold"
                  >
                    <Camera className="w-8 h-8 mr-3" />
                    Abrir Câmera
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-900 text-gray-400">ou</span>
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
                    variant="outline"
                    className="w-full h-24 border-dashed border-2 border-gray-600 hover:border-blue-500 bg-transparent"
                  >
                    <Upload className="w-6 h-6 mr-3" />
                    Fazer Upload de Imagem
                  </Button>

                  <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <p className="text-xs text-blue-300 text-center">
                      💡 Dica: Para melhor precisão, fotografe o alimento de cima, com boa iluminação
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {showCamera && (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4 flex gap-3">
                  <Button
                    onClick={capturePhoto}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capturar
                  </Button>
                  <Button
                    onClick={() => setShowCamera(false)}
                    variant="outline"
                    className="border-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            )}

            {imagePreview && (
              <Card className="bg-slate-900/50 backdrop-blur-xl border-white/10 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Food preview"
                  className="w-full aspect-video object-cover"
                />
                
                <div className="p-6 space-y-4">
                  {!nutritionData && !analyzing && (
                    <>
                      <MealTypeSelector 
                        selected={selectedMealType}
                        onChange={setSelectedMealType}
                      />
                      <div className="flex gap-3">
                        <Button
                          onClick={analyzeFood}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Analisar com IA
                        </Button>
                        <Button
                          onClick={reset}
                          variant="outline"
                          className="border-white/10"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </>
                  )}

                  {analyzing && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                      <Loader2 className="w-12 h-12 animate-spin text-blue-400" />
                      <p className="text-gray-300">Analisando com IA de precisão...</p>
                      <p className="text-xs text-gray-400">Consultando base nutricional</p>
                    </div>
                  )}

                  {nutritionData && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" />
                          Análise Completa
                        </Badge>
                      </div>
                      <NutritionResults data={nutritionData} />
                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={() => saveFood(nutritionData)}
                          disabled={saving}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                        >
                          {saving ? (
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Check className="w-5 h-5 mr-2" />
                          )}
                          Salvar no Diário
                        </Button>
                        <Button
                          onClick={reset}
                          variant="outline"
                          className="border-white/10"
                        >
                          Nova Foto
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