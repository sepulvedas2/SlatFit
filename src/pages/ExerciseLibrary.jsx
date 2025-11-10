import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Dumbbell, Edit, Trash2, X, Upload, Loader2, 
  Calendar, Zap, Target
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function ExerciseLibrary() {
  const [user, setUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [uploadingGif, setUploadingGif] = useState(false);
  const [formData, setFormData] = useState({
    exercise_name: "",
    description: "",
    sets_reps: "",
    gif_url: "",
    workout_day: "",
    category: "full_body",
    difficulty: "intermediario"
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Exercise.filter({ user_email: user.email });
    },
    enabled: !!user?.email,
  });

  const addExerciseMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Exercise.create({
        user_email: user.email,
        ...data
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      resetForm();
      setShowAddModal(false);
    },
  });

  const updateExerciseMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      return base44.entities.Exercise.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
      resetForm();
      setShowAddModal(false);
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async (id) => {
      return base44.entities.Exercise.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['exercises']);
    },
  });

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingGif(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, gif_url: file_url });
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploadingGif(false);
  };

  const handleSubmit = () => {
    if (!formData.exercise_name || !formData.sets_reps) return;

    if (editingExercise) {
      updateExerciseMutation.mutate({
        id: editingExercise.id,
        data: formData
      });
    } else {
      addExerciseMutation.mutate(formData);
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setFormData({
      exercise_name: exercise.exercise_name,
      description: exercise.description || "",
      sets_reps: exercise.sets_reps,
      gif_url: exercise.gif_url || "",
      workout_day: exercise.workout_day || "",
      category: exercise.category || "full_body",
      difficulty: exercise.difficulty || "intermediario"
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      exercise_name: "",
      description: "",
      sets_reps: "",
      gif_url: "",
      workout_day: "",
      category: "full_body",
      difficulty: "intermediario"
    });
    setEditingExercise(null);
  };

  const categoryLabels = {
    pernas: "Pernas",
    peito: "Peito",
    costas: "Costas",
    ombros: "Ombros",
    braços: "Braços",
    abdomen: "Abdômen",
    cardio: "Cardio",
    full_body: "Corpo Todo"
  };

  const difficultyColors = {
    iniciante: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediario: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    avancado: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Dumbbell className="w-8 h-8 text-[#084734]" />
              Meus Treinos
            </h1>
            <p className="text-gray-600 mt-1">
              Crie e organize sua biblioteca de exercícios
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="bg-[#084734] hover:bg-[#084734]/90 text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Treino
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{exercises.length}</p>
                <p className="text-xs text-gray-600">Exercícios</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {exercises.filter(e => e.category === "cardio").length}
                </p>
                <p className="text-xs text-gray-600">Cardio</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {exercises.filter(e => e.category !== "cardio").length}
                </p>
                <p className="text-xs text-gray-600">Musculação</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Exercise Grid */}
        {exercises.length === 0 ? (
          <Card className="p-12 text-center bg-gray-50 border-gray-200">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum exercício cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro exercício personalizado
            </p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#084734] hover:bg-[#084734]/90 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Criar Primeiro Exercício
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {exercises.map((exercise) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="p-6 hover:shadow-xl transition-all bg-white border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          🏋️ {exercise.exercise_name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#084734]/10 text-[#084734] border-[#084734]/20 text-xs">
                            {categoryLabels[exercise.category]}
                          </Badge>
                          <Badge className={`${difficultyColors[exercise.difficulty]} text-xs`}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(exercise)}
                          className="text-gray-600 hover:text-[#084734] hover:bg-[#084734]/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteExerciseMutation.mutate(exercise.id)}
                          className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {exercise.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        📄 {exercise.description}
                      </p>
                    )}

                    <div className="text-sm font-semibold text-gray-900 mb-4">
                      🔁 {exercise.sets_reps}
                    </div>

                    {exercise.workout_day && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>{exercise.workout_day}</span>
                      </div>
                    )}

                    {exercise.gif_url && (
                      <div className="mt-4">
                        <img
                          src={exercise.gif_url}
                          alt={exercise.exercise_name}
                          className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-200"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={(open) => {
        setShowAddModal(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-white border-gray-200 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900 flex items-center justify-between">
              <span>
                {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-700">Nome do Exercício *</Label>
              <Input
                placeholder="Ex: Agachamento Livre"
                value={formData.exercise_name}
                onChange={(e) => setFormData({...formData, exercise_name: e.target.value})}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label className="text-gray-700">Descrição</Label>
              <Textarea
                placeholder="Ex: Fortalece pernas e glúteos"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="bg-white border-gray-300 text-gray-900"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-gray-700">Séries e Repetições *</Label>
              <Input
                placeholder="Ex: 3 séries de 12 repetições"
                value={formData.sets_reps}
                onChange={(e) => setFormData({...formData, sets_reps: e.target.value})}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-700">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-700">Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({...formData, difficulty: value})}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-gray-700">Dia do Treino (Opcional)</Label>
              <Input
                placeholder="Ex: Segunda-feira"
                value={formData.workout_day}
                onChange={(e) => setFormData({...formData, workout_day: e.target.value})}
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div>
              <Label className="text-gray-700">GIF Demonstrativo (300x400px)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/gif,image/png,image/jpeg"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="gif-upload"
                />
                <label htmlFor="gif-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-gray-300 text-gray-900 hover:bg-gray-100"
                    disabled={uploadingGif}
                    onClick={() => document.getElementById('gif-upload').click()}
                  >
                    {uploadingGif ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Fazendo upload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload de GIF
                      </>
                    )}
                  </Button>
                </label>
                {formData.gif_url && (
                  <div className="mt-3">
                    <img
                      src={formData.gif_url}
                      alt="Preview"
                      className="w-full h-[300px] object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!formData.exercise_name || !formData.sets_reps || addExerciseMutation.isPending}
              className="w-full bg-[#084734] hover:bg-[#084734]/90 text-white"
            >
              {addExerciseMutation.isPending || updateExerciseMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  {editingExercise ? 'Atualizar' : 'Adicionar'} Exercício
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}