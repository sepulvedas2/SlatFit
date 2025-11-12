import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Upload, X, Loader2, Image as ImageIcon, 
  Info, Zap, Target, Check, Film, Sparkles
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LottieAnimation from "./LottieAnimation";

export default function ExerciseDetailModal({ exercise, isOpen, onClose, isAdmin }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    short_description: exercise?.short_description || "",
    image_url: exercise?.image_url || "",
    lottie_url: exercise?.lottie_url || "",
    gif_url: exercise?.gif_url || "",
    video_url: exercise?.video_url || "",
    reps_suggestion: exercise?.reps_suggestion || exercise?.reps || "",
    series_suggestion: exercise?.series_suggestion || "",
    duration_seconds: exercise?.duration_seconds || exercise?.duration || 30,
    difficulty: exercise?.difficulty || "intermediario",
    category: exercise?.category || "cardio",
    instructions: exercise?.instructions || ""
  });
  
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen && exercise) {
      if (exercise.id) {
        setCurrentExercise(exercise);
        setFormData({
          name: exercise.name,
          description: exercise.description || "",
          short_description: exercise.short_description || "",
          image_url: exercise.image_url || "",
          lottie_url: exercise.lottie_url || "",
          gif_url: exercise.gif_url || "",
          video_url: exercise.video_url || "",
          reps_suggestion: exercise.reps_suggestion,
          series_suggestion: exercise.series_suggestion || "",
          duration_seconds: exercise.duration_seconds,
          difficulty: exercise.difficulty || "intermediario",
          category: exercise.category || "cardio",
          instructions: exercise.instructions || ""
        });
      } else {
        setCurrentExercise(null);
        setFormData({
          name: exercise.name,
          description: exercise.description || "",
          short_description: exercise.short_description || "",
          image_url: exercise.image_url || "",
          lottie_url: exercise.lottie_url || "",
          gif_url: exercise.gif_url || "",
          video_url: exercise.video_url || "",
          reps_suggestion: exercise.reps || "",
          series_suggestion: "",
          duration_seconds: exercise.duration || 30,
          difficulty: "intermediario",
          category: "cardio",
          instructions: ""
        });
      }
    }
  }, [isOpen, exercise]);

  const createOrUpdateExerciseMutation = useMutation({
    mutationFn: async (data) => {
      if (currentExercise?.id) {
        return base44.entities.Exercise.update(currentExercise.id, data);
      } else {
        return base44.entities.Exercise.create(data);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['exercises']);
      setCurrentExercise(result);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err) => {
      setError("Erro ao salvar exercício. Tente novamente.");
      setTimeout(() => setError(null), 5000);
    }
  });

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    setError(null);
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const updatedData = { ...formData, image_url: file_url };
      setFormData(updatedData);
      await createOrUpdateExerciseMutation.mutateAsync(updatedData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      setError("Erro ao fazer upload da imagem. Tente novamente.");
      setTimeout(() => setError(null), 5000);
    }
    
    setUploading(false);
  };

  const handleSave = async () => {
    setError(null);
    createOrUpdateExerciseMutation.mutate(formData);
  };

  const difficultyColors = {
    iniciante: "bg-green-500/20 text-green-600 border-green-500/30",
    intermediario: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
    avancado: "bg-red-500/20 text-red-600 border-red-500/30"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-gray-200 max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[#09142D] text-2xl font-bold">
              {formData.name || "Novo Exercício"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-[#09142D]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {success && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Exercício salvo com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Animation Preview */}
          {(formData.lottie_url || formData.gif_url) && !editing && (
            <div className="flex justify-center p-6 bg-gradient-to-br from-[#0E9E4D]/5 to-[#59F394]/5 rounded-2xl">
              {formData.lottie_url ? (
                <LottieAnimation url={formData.lottie_url} className="w-40 h-40" />
              ) : formData.gif_url ? (
                <img src={formData.gif_url} alt={formData.name} className="w-40 h-40 object-contain" />
              ) : null}
            </div>
          )}

          {/* Editing Mode: Animation URLs */}
          {editing && isAdmin && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#0E9E4D]" />
                <Label className="text-[#09142D] font-semibold">Animações</Label>
              </div>
              
              <div>
                <Label className="text-gray-700">URL Animação Lottie (.json)</Label>
                <Input
                  value={formData.lottie_url}
                  onChange={(e) => setFormData({...formData, lottie_url: e.target.value})}
                  placeholder="https://assets.lottiefiles.com/..."
                  className="bg-white border-gray-200 text-[#09142D]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ex: https://assets2.lottiefiles.com/packages/lf20_ynbm5x3d.json
                </p>
              </div>

              <div>
                <Label className="text-gray-700">URL GIF Animado</Label>
                <Input
                  value={formData.gif_url}
                  onChange={(e) => setFormData({...formData, gif_url: e.target.value})}
                  placeholder="https://exemplo.com/exercise.gif"
                  className="bg-white border-gray-200 text-[#09142D]"
                />
              </div>

              <div>
                <Label className="text-gray-700">URL Vídeo Completo</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-white border-gray-200 text-[#09142D]"
                />
              </div>
            </div>
          )}

          {/* Exercise Info */}
          <div className="space-y-4">
            {editing && isAdmin ? (
              <>
                <div>
                  <Label className="text-[#09142D]">Nome do Exercício</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white border-gray-200 text-[#09142D]"
                  />
                </div>

                <div>
                  <Label className="text-[#09142D]">Descrição Curta (para o card)</Label>
                  <Input
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                    placeholder="3 séries de 12 repetições — mantenha a postura ereta"
                    className="bg-white border-gray-200 text-[#09142D]"
                  />
                </div>

                <div>
                  <Label className="text-[#09142D]">Descrição Completa</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Como executar este exercício..."
                    className="bg-white border-gray-200 text-[#09142D] min-h-[100px]"
                  />
                </div>

                <div>
                  <Label className="text-[#09142D]">Instruções Passo a Passo</Label>
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                    placeholder="1. Posicione os pés na largura dos ombros...&#10;2. Desça controladamente..."
                    className="bg-white border-gray-200 text-[#09142D] min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#09142D]">Sugestão de Séries</Label>
                    <Input
                      value={formData.series_suggestion}
                      onChange={(e) => setFormData({...formData, series_suggestion: e.target.value})}
                      placeholder="3 séries de 12 repetições"
                      className="bg-white border-gray-200 text-[#09142D]"
                    />
                  </div>

                  <div>
                    <Label className="text-[#09142D]">Repetições</Label>
                    <Input
                      value={formData.reps_suggestion}
                      onChange={(e) => setFormData({...formData, reps_suggestion: e.target.value})}
                      placeholder="Ex: 10x, 8/8"
                      className="bg-white border-gray-200 text-[#09142D]"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label className="text-[#09142D]">Imagem Demonstrativa</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                      placeholder="URL da imagem ou faça upload"
                      className="bg-white border-gray-200 text-[#09142D]"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      variant="outline"
                      className="border-gray-200"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    className="hidden"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={difficultyColors[formData.difficulty]}>
                    {formData.difficulty}
                  </Badge>
                  <Badge className="bg-gradient-to-r from-[#0E9E4D]/10 to-[#59F394]/10 text-[#0E9E4D] border-0">
                    {formData.category}
                  </Badge>
                </div>

                {formData.description && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-[#0E9E4D]" />
                      <p className="text-[#09142D] font-semibold text-sm">Como Executar</p>
                    </div>
                    <p className="text-[#3B5EED] text-sm leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}

                {formData.instructions && (
                  <div className="p-4 bg-gradient-to-br from-[#0E9E4D]/5 to-[#59F394]/5 rounded-xl border border-[#0E9E4D]/20">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-[#0E9E4D]" />
                      <p className="text-[#09142D] font-semibold text-sm">Instruções</p>
                    </div>
                    <div className="text-[#3B5EED] text-sm leading-relaxed whitespace-pre-line">
                      {formData.instructions}
                    </div>
                  </div>
                )}

                {formData.video_url && (
                  <Button
                    onClick={() => window.open(formData.video_url, '_blank')}
                    className="w-full bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white"
                  >
                    <Film className="w-4 h-4 mr-2" />
                    Assistir Vídeo Completo
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#0E9E4D]" />
                      <p className="text-gray-500 text-xs">Repetições</p>
                    </div>
                    <p className="text-[#09142D] font-bold text-lg">{formData.reps_suggestion}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#0E9E4D]" />
                      <p className="text-gray-500 text-xs">Duração</p>
                    </div>
                    <p className="text-[#09142D] font-bold text-lg">{formData.duration_seconds}s</p>
                  </div>
                </div>

                {formData.image_url && (
                  <div className="rounded-xl overflow-hidden border border-gray-100">
                    <img
                      src={formData.image_url}
                      alt={formData.name}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={createOrUpdateExerciseMutation.isPending || !formData.name}
                    className="flex-1 bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white"
                  >
                    {createOrUpdateExerciseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditing(false)}
                    variant="outline"
                    className="border-gray-200"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="w-full border-[#0E9E4D]/20 hover:bg-[#0E9E4D]/5 text-[#0E9E4D]"
                >
                  Editar Exercício
                </Button>
              )}
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}