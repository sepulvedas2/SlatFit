import React, { useState, useRef } from "react";
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
  Info, Zap, Target 
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ExerciseDetailModal({ exercise, isOpen, onClose, isAdmin }) {
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    image_url: exercise?.image_url || "",
    reps_suggestion: exercise?.reps_suggestion || "",
    duration_seconds: exercise?.duration_seconds || 30,
    difficulty: exercise?.difficulty || "intermediario",
    category: exercise?.category || "cardio"
  });
  
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const updateExerciseMutation = useMutation({
    mutationFn: async (data) => {
      if (exercise?.id) {
        return base44.entities.Exercise.update(exercise.id, data);
      } else {
        return base44.entities.Exercise.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      setEditing(false);
    },
  });

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      // Resize image to 300x400 (would need a canvas/library in production)
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const updatedData = { ...formData, image_url: file_url };
      setFormData(updatedData);
      
      if (exercise?.id) {
        await updateExerciseMutation.mutateAsync(updatedData);
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploading(false);
  };

  const handleSave = () => {
    updateExerciseMutation.mutate(formData);
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
              {exercise?.name || "Novo Exercício"}
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
          
          {/* Image Section */}
          <div className="space-y-3">
            <Label className="text-white">Imagem Demonstrativa</Label>
            
            {formData.image_url ? (
              <div className="relative w-full aspect-[3/4] max-w-[300px] mx-auto rounded-lg overflow-hidden border-2 border-[#CEF17B]/30">
                <img
                  src={formData.image_url}
                  alt={formData.name}
                  className="w-full h-full object-cover"
                />
                {isAdmin && editing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Trocar Imagem
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[3/4] max-w-[300px] mx-auto rounded-lg border-2 border-dashed border-[#CEF17B]/30 flex flex-col items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                   onClick={() => isAdmin && editing && fileInputRef.current?.click()}
              >
                <ImageIcon className="w-12 h-12 text-white/40 mb-2" />
                <p className="text-white/60 text-sm text-center px-4">
                  {isAdmin && editing ? "Clique para adicionar uma imagem" : "Sem imagem disponível"}
                </p>
                <p className="text-white/40 text-xs mt-1">Recomendado: 300x400px</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="hidden"
            />

            {isAdmin && !editing && !formData.image_url && (
              <Button
                onClick={() => {
                  setEditing(true);
                  fileInputRef.current?.click();
                }}
                variant="outline"
                className="w-full border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Adicionar Imagem
              </Button>
            )}
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
          {isAdmin && (
            <div className="flex gap-3 pt-4 border-t border-white/10">
              {editing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={updateExerciseMutation.isPending}
                    className="flex-1 bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90"
                  >
                    {updateExerciseMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: exercise?.name || "",
                        description: exercise?.description || "",
                        image_url: exercise?.image_url || "",
                        reps_suggestion: exercise?.reps_suggestion || "",
                        duration_seconds: exercise?.duration_seconds || 30,
                        difficulty: exercise?.difficulty || "intermediario",
                        category: exercise?.category || "cardio"
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