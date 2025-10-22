import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Upload, Sparkles, Loader2, Check, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import NutritionResults from "../components/scanner/NutritionResults";
import MealTypeSelector from "../components/scanner/MealTypeSelector";

export default function FoodScanner() {
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("lunch");
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

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
        prompt: `Analise esta imagem de alimento e retorne informações nutricionais PRECISAS.
        
        Identifique:
        1. Nome do alimento principal
        2. Tamanho estimado da porção (ex: "1 prato médio", "150g", "1 unidade")
        3. Valores nutricionais aproximados para esta porção:
           - Calorias (kcal)
           - Proteínas (g)
           - Carboidratos (g)
           - Gorduras (g)
        
        Seja preciso e realista com as quantidades. Se houver múltiplos alimentos, some os valores totais.
        Se não conseguir identificar com certeza, informe isso no campo food_name.`,
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
      setError("Erro ao analisar a imagem. Tente novamente.");
      console.error(err);
    }

    setAnalyzing(false);
  };

  const saveFood = async () => {
    if (!nutritionData || !user) return;

    setSaving(true);
    try {
      await base44.entities.FoodLog.create({
        user_email: user.email,
        food_name: nutritionData.food_name,
        meal_type: selectedMealType,
        calories: nutritionData.calories,
        protein: nutritionData.protein,
        carbs: nutritionData.carbs,
        fats: nutritionData.fats,
        portion_size: nutritionData.portion_size,
        image_url: nutritionData.image_url,
        log_date: new Date().toISOString().split('T')[0]
      });

      setSelectedImage(null);
      setImagePreview(null);
      setNutritionData(null);
      setError(null);
    } catch (err) {
      setError("Erro ao salvar o alimento. Tente novamente.");
    }
    setSaving(false);
  };

  const reset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNutritionData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-4">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Scanner IA</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Escanear Alimento
          </h1>
          <p className="text-gray-400 mt-2">
            Tire uma foto ou faça upload para análise nutricional instantânea
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Area */}
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
            </div>
          </Card>
        )}

        {/* Camera View */}
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

        {/* Image Preview & Analysis */}
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
                  <p className="text-gray-300">Analisando nutrientes...</p>
                </div>
              )}

              {nutritionData && (
                <>
                  <NutritionResults data={nutritionData} />
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={saveFood}
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

      </div>
    </div>
  );
}