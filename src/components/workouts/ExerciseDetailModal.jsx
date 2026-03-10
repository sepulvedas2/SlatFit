import React, { useState, useEffect } from "react";
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
  X, Info, Zap, Target, Check, Loader2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getExerciseImage } from "./exerciseImages";

export default function ExerciseDetailModal({ exercise, isOpen, onClose, isAdmin, isHIIT = false }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    image_url: exercise?.image_url || "",
    reps_suggestion: exercise?.reps_suggestion || exercise?.reps || "",
    duration_seconds: exercise?.duration_seconds || exercise?.duration || 30,
    difficulty: exercise?.difficulty || "intermediario",
    category: exercise?.category || "cardio"
  });
  
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  // Check if exercise exists in DB when modal opens
  useEffect(() => {
    const loadExercise = async () => {
      if (isOpen && exercise) {
        // First, check if this exercise already exists in DB by name
        try {
          const existingExercises = await base44.entities.Exercise.filter({ name: exercise.name });
          if (existingExercises && existingExercises.length > 0) {
            const dbExercise = existingExercises[0];
            setCurrentExercise(dbExercise);
            setFormData({
              name: dbExercise.name,
              description: dbExercise.description || "",
              image_url: dbExercise.image_url || "",
              reps_suggestion: dbExercise.reps_suggestion || exercise.reps || "",
              duration_seconds: dbExercise.duration_seconds || exercise.duration || 30,
              difficulty: dbExercise.difficulty || "intermediario",
              category: dbExercise.category || "cardio"
            });
            return;
          }
        } catch (err) {
          console.error("Error loading exercise:", err);
        }

        // If exercise has an ID, it's from the database
        if (exercise.id) {
          setCurrentExercise(exercise);
          setFormData({
            name: exercise.name,
            description: exercise.description || "",
            image_url: exercise.image_url || "",
            reps_suggestion: exercise.reps_suggestion,
            duration_seconds: exercise.duration_seconds,
            difficulty: exercise.difficulty || "intermediario",
            category: exercise.category || "cardio"
          });
        } else {
          // Exercise from hardcoded data
          setCurrentExercise(null);
          setFormData({
            name: exercise.name,
            description: exercise.description || "",
            image_url: exercise.image_url || "",
            reps_suggestion: exercise.reps || "",
            duration_seconds: exercise.duration || 30,
            difficulty: "intermediario",
            category: "cardio"
          });
        }
      }
    };
    
    loadExercise();
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
      setFormData({
        name: result.name,
        description: result.description || "",
        image_url: result.image_url || "",
        reps_suggestion: result.reps_suggestion || "",
        duration_seconds: result.duration_seconds || 30,
        difficulty: result.difficulty || "intermediario",
        category: result.category || "cardio"
      });
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
      // Upload the file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Update form data
      const updatedData = { 
        ...formData, 
        image_url: file_url 
      };
      setFormData(updatedData);
      
      // Save to database
      const result = await createOrUpdateExerciseMutation.mutateAsync(updatedData);
      
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
    iniciante: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediario: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    avancado: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              {formData.name || "Novo Exercício"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          
          {/* Success/Error Messages */}
          {success && (
            <Alert className="bg-green-500/20 border-green-500/30">
              <Check className="w-4 h-4 text-green-400" />
              <AlertDescription className="text-green-400">
                Exercício salvo com sucesso!
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="bg-red-500/20 border-red-500/30">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Image Section - Native image from code */}
          <div className="space-y-3">
            <div className="relative w-full aspect-[3/4] max-w-[280px] mx-auto rounded-xl overflow-hidden border-2 border-[#CEF17B]/30">
              <img
                src={formData.image_url || getExerciseImage(formData.name)}
                alt={formData.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = getExerciseImage(formData.name);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>

          {/* Exercise Info */}
          <div className="space-y-4">
            {editing && isAdmin ? (
              <>
                <div>
                  <Label className="text-white">Nome do Exercício</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Descrição</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Como executar este exercício..."
                    className="bg-white/5 border-white/10 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Repetições</Label>
                    <Input
                      value={formData.reps_suggestion}
                      onChange={(e) => setFormData({...formData, reps_suggestion: e.target.value})}
                      placeholder="Ex: 10x, 8/8"
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Duração (segundos)</Label>
                    <Input
                      type="number"
                      value={formData.duration_seconds}
                      onChange={(e) => setFormData({...formData, duration_seconds: parseInt(e.target.value)})}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={difficultyColors[formData.difficulty]}>
                    {formData.difficulty}
                  </Badge>
                  <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                    {formData.category}
                  </Badge>
                </div>

                {formData.description && (
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-[#CEF17B]" />
                      <p className="text-white font-semibold text-sm">Como Executar</p>
                    </div>
                    <p className="text-[#CEEDB2] text-sm leading-relaxed">
                      {formData.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-[#CEF17B]" />
                      <p className="text-white/60 text-xs">Repetições</p>
                    </div>
                    <p className="text-white font-bold text-lg">{formData.reps_suggestion}</p>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-[#CEF17B]" />
                      <p className="text-white/60 text-xs">Duração</p>
                    </div>
                    <p className="text-white font-bold text-lg">{formData.duration_seconds}s</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {isAdmin && !isHIIT && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={createOrUpdateExerciseMutation.isPending || !formData.name}
                    className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90"
                  >
                    {createOrUpdateExerciseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: currentExercise?.name || exercise?.name || "",
                        description: currentExercise?.description || exercise?.description || "",
                        image_url: currentExercise?.image_url || exercise?.image_url || "",
                        reps_suggestion: currentExercise?.reps_suggestion || exercise?.reps || "",
                        duration_seconds: currentExercise?.duration_seconds || exercise?.duration || 30,
                        difficulty: currentExercise?.difficulty || "intermediario",
                        category: currentExercise?.category || "cardio"
                      });
                    }}
                    variant="outline"
                    className="border-white/10 hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="w-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
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