import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Dumbbell, Play, Clock, ChevronDown, ChevronUp, Image, Upload, Loader2, X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import PRModal from "./PRModal";

export default function WeeklyPlan({ weekNumber, dailyWorkouts = [], onStartWorkout, onCompleteDay }) {
  const [expandedDay, setExpandedDay] = useState(null);
  const [uploadingExercise, setUploadingExercise] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [prModalOpen, setPRModalOpen] = useState(false);
  const [selectedPRExercise, setSelectedPRExercise] = useState(null);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Fetch all exercises from database to get saved images
  const { data: savedExercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => db.Exercise.list(),
  });

  // Fetch all PR records for current user
  const { data: prRecords = [] } = useQuery({
    queryKey: ['prRecords', user?.email],
    queryFn: () => db.PRRecord.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  // Create a map of exercise names to their data (including image_url)
  const exerciseImageMap = savedExercises.reduce((acc, ex) => {
    if (ex.image_url) {
      acc[ex.name] = ex.image_url;
    }
    return acc;
  }, {});

  // Create a map of exercise names to their latest PR
  const prMap = prRecords.reduce((acc, pr) => {
    if (!acc[pr.exercise_name] || new Date(pr.data_pr) > new Date(acc[pr.exercise_name].data_pr)) {
      acc[pr.exercise_name] = pr;
    }
    return acc;
  }, {});

  const handleImageUpload = async (file, exerciseName) => {
    if (!file) return;
    
    setUploadingExercise(exerciseName);
    try {
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Check if exercise already exists in DB
      const existingExercises = await db.Exercise.filter({ name: exerciseName });
      
      if (existingExercises && existingExercises.length > 0) {
        // Update existing exercise
        await db.Exercise.update(existingExercises[0].id, { image_url: file_url });
      } else {
        // Create new exercise record
        await db.Exercise.create({
          name: exerciseName,
          image_url: file_url,
          reps_suggestion: "3x10",
          duration_seconds: 30
        });
      }
      
      // Refresh exercises list
      queryClient.invalidateQueries(['exercises']);
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
    }
    setUploadingExercise(null);
  };

  const triggerFileInput = (exerciseName) => {
    setSelectedExercise(exerciseName);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && selectedExercise) {
      handleImageUpload(file, selectedExercise);
    }
    e.target.value = '';
  };

  const removeImage = async (exerciseName) => {
    try {
      const existingExercises = await db.Exercise.filter({ name: exerciseName });
      if (existingExercises && existingExercises.length > 0) {
        await db.Exercise.update(existingExercises[0].id, { image_url: "" });
        queryClient.invalidateQueries(['exercises']);
      }
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
    }
  };

  // Definição dos treinos por semana
  const weekPlans = {
    // Semana 1 - Nível Iniciante
    1: {
    segunda: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Supino inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino no banco declinado", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps pulley", sets: "3x", reps: "12-15", image_placeholder: "triceps_pulley" },
        { name: "Tríceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "triceps_barra" },
        { name: "Tríceps corda", sets: "3x", reps: "12-15", image_placeholder: "triceps_corda" }
      ]
    },
    terca: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada baixa aberta", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada Alta à Frente", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
        { name: "Bíceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps alternado", sets: "3x", reps: "12-15", image_placeholder: "biceps_alternado" },
        { name: "Mergulho no Banco", sets: "3x", reps: "10-12", image_placeholder: "mergulho_banco" }
      ]
    },
    quarta: { 
      muscle: "Pernas", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento Livre", sets: "4x", reps: "8-12", image_placeholder: "agachamento" },
        { name: "Leg press 45", sets: "3x", reps: "10-15", image_placeholder: "leg_press" },
        { name: "Cadeira extensora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira flexora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_flexora" },
        { name: "Agachamento sumô", sets: "3x", reps: "10-12", image_placeholder: "agachamento_sumo" },
        { name: "Panturrilha no Leg Press Horizontal", sets: "3x", reps: "12-15", image_placeholder: "panturrilha" }
      ]
    },
    quinta: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada baixa aberta", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada Alta à Frente", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
        { name: "Bíceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps alternado", sets: "3x", reps: "12-15", image_placeholder: "biceps_alternado" },
        { name: "Bíceps martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" }
      ]
    },
    sexta: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Supino inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino no banco declinado", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps pulley", sets: "3x", reps: "12-15", image_placeholder: "triceps_pulley" },
        { name: "Tríceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "triceps_barra" },
        { name: "Tríceps corda", sets: "3x", reps: "12-15", image_placeholder: "triceps_corda" }
      ]
    },
    sabado: { 
      muscle: "Ombro / Abdômen", 
      icon: "🏋️",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Elevação Lateral Sentado", sets: "3x", reps: "10-12", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal com Anilha", sets: "3x", reps: "10-12", image_placeholder: "elevacao_frontal" },
        { name: "Desenvolvimento com Rotação de Ombro", sets: "3x", reps: "12-15", image_placeholder: "rotacao_ombro" },
        { name: "Prancha", sets: "3x", reps: "30-60s", image_placeholder: "prancha" },
        { name: "Abdominal infra", sets: "3x", reps: "12-15", image_placeholder: "abdominal_infra" },
        { name: "Abdominal reto", sets: "3x", reps: "10-12", image_placeholder: "abdominal_reto" }
      ]
    }
  },

  // Semana 2 - Nível Intermediário
  2: {
    segunda: { 
      muscle: "Peito / Ombro", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino Inclinado", sets: "4x", reps: "8-12", image_placeholder: "supino_inclinado" },
        { name: "Supino Reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Flexão de Braço", sets: "4x", reps: "8", image_placeholder: "flexao_braco" },
        { name: "Desenvolvimento com Halteres", sets: "3x", reps: "12", image_placeholder: "desenvolvimento_halteres" },
        { name: "Elevação Lateral", sets: "3x", reps: "12", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal", sets: "3x", reps: "12", image_placeholder: "elevacao_frontal" }
      ]
    },
    terca: { 
      muscle: "Costas / Tríceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada Baixa com Triângulo", sets: "4x", reps: "12", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta à Frente", sets: "4x", reps: "12", image_placeholder: "puxada_alta" },
        { name: "Remada Curvada na Barra em Pé", sets: "4x", reps: "12", image_placeholder: "remada_curvada" },
        { name: "Tríceps Pulley Barra", sets: "3x", reps: "10-12", image_placeholder: "triceps_pulley" },
        { name: "Tríceps Testa no Banco", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps na Máquina", sets: "3x", reps: "10-12", image_placeholder: "triceps_maquina" }
      ]
    },
    quarta: { 
      muscle: "Perna", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento a Fundo", sets: "4x", reps: "10-12", image_placeholder: "agachamento_fundo" },
        { name: "Leg Press Horizontal", sets: "4x", reps: "10-12", image_placeholder: "leg_press" },
        { name: "Cadeira Extensora", sets: "3x", reps: "12-15", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira Flexora", sets: "3x", reps: "12-15", image_placeholder: "cadeira_flexora" },
        { name: "Agachamento Sumô", sets: "3x", reps: "12-15", image_placeholder: "agachamento_sumo" },
        { name: "Panturrilha no Leg Press Horizontal", sets: "3x", reps: "12-15", image_placeholder: "panturrilha" }
      ]
    },
    quinta: { 
      muscle: "Peito / Ombro", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino Inclinado", sets: "4x", reps: "8-12", image_placeholder: "supino_inclinado" },
        { name: "Supino Reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Flexão de Braço", sets: "4x", reps: "8", image_placeholder: "flexao_braco" },
        { name: "Desenvolvimento com Halteres", sets: "3x", reps: "12", image_placeholder: "desenvolvimento_halteres" },
        { name: "Elevação Lateral", sets: "3x", reps: "12", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal", sets: "3x", reps: "12", image_placeholder: "elevacao_frontal" }
      ]
    },
    sexta: { 
      muscle: "Costas / Tríceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada Baixa com Triângulo", sets: "4x", reps: "12", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta à Frente", sets: "4x", reps: "12", image_placeholder: "puxada_alta" },
        { name: "Remada Curvada na Barra em Pé", sets: "4x", reps: "12", image_placeholder: "remada_curvada" },
        { name: "Tríceps Pulley Barra", sets: "3x", reps: "10-12", image_placeholder: "triceps_pulley" },
        { name: "Tríceps Testa no Banco", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps na Máquina", sets: "3x", reps: "10-12", image_placeholder: "triceps_maquina" }
      ]
    },
    sabado: { 
      muscle: "Posteriores", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Puxada Alta Aberta", sets: "4x", reps: "8-12", image_placeholder: "puxada_alta_aberta" },
        { name: "Remada Baixa com Triângulo", sets: "3x", reps: "10-15", image_placeholder: "remada_baixa" },
        { name: "Mesa Flexora", sets: "3x", reps: "10-12", image_placeholder: "mesa_flexora" },
        { name: "Stiff", sets: "3x", reps: "8-12", image_placeholder: "stiff" },
        { name: "Tríceps Corda", sets: "3x", reps: "12-15", image_placeholder: "triceps_corda" },
        { name: "Tríceps Máquina", sets: "3x", reps: "10-12", image_placeholder: "triceps_maquina" }
      ]
    }
  },

  // Semana 4 - Nível Expert
  4: {
    segunda: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino reto com halteres", sets: "4x", reps: "10-12", image_placeholder: "supino_halteres" },
        { name: "Supino com Barra", sets: "3x", reps: "12-15", image_placeholder: "supino_barra" },
        { name: "Crucifixo com Halteres", sets: "3x", reps: "12-15", image_placeholder: "crucifixo_halteres" },
        { name: "Supino no banco declinado", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Testa na Polia", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps francês no banco", sets: "3x", reps: "10-12", image_placeholder: "triceps_invertida" }
      ]
    },
    terca: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada Livre no Banco", sets: "4x", reps: "10-12", image_placeholder: "remada_banco" },
        { name: "Puxada Aberta na Polia", sets: "3x", reps: "8-10", image_placeholder: "puxada_aberta" },
        { name: "Puxada Fechada Triângulo", sets: "3x", reps: "8-10", image_placeholder: "puxada_triangulo" },
        { name: "Pullover na Polia com Corda", sets: "3x", reps: "8-10", image_placeholder: "pullover_polia" },
        { name: "Rosca Direta Barra", sets: "3x", reps: "10-12", image_placeholder: "rosca_direta" },
        { name: "Bíceps Martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" },
        { name: "Rosca Scott", sets: "3x", reps: "10-12", image_placeholder: "rosca_scott" }
      ]
    },
    quarta: { 
      muscle: "Perna / Ombro", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento com Salto", sets: "3x", reps: "8-12", image_placeholder: "agachamento_salto" },
        { name: "Leg Press", sets: "3x", reps: "12-15", image_placeholder: "leg_press" },
        { name: "Cadeira Extensora", sets: "3x", reps: "12-15", image_placeholder: "cadeira_extensora" },
        { name: "Mesa Flexora", sets: "3x", reps: "10-12", image_placeholder: "mesa_flexora" },
        { name: "Desenvolvimento com Halteres", sets: "3x", reps: "10", image_placeholder: "desenvolvimento_halteres" },
        { name: "Remada Alta", sets: "3x", reps: "10", image_placeholder: "remada_alta" },
        { name: "Elevação Lateral na Polia", sets: "3x", reps: "10", image_placeholder: "elevacao_polia" }
      ]
    },
    quinta: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada Livre no Banco", sets: "4x", reps: "10-12", image_placeholder: "remada_banco" },
        { name: "Puxada Aberta na Polia", sets: "3x", reps: "8-10", image_placeholder: "puxada_aberta" },
        { name: "Puxada Fechada Triângulo", sets: "3x", reps: "8-10", image_placeholder: "puxada_triangulo" },
        { name: "Pullover na Polia com Corda", sets: "3x", reps: "8-10", image_placeholder: "pullover_polia" },
        { name: "Rosca Direta Barra", sets: "3x", reps: "10-12", image_placeholder: "rosca_direta" },
        { name: "Bíceps Martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" },
        { name: "Rosca Scott", sets: "3x", reps: "10-12", image_placeholder: "rosca_scott" }
      ]
    },
    sexta: { 
      muscle: "Perna / Ombro", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Avanço", sets: "3x", reps: "10-12", image_placeholder: "agachamento_lateral" },
        { name: "Leg Press", sets: "3x", reps: "10-15", image_placeholder: "leg_press" },
        { name: "Cadeira Extensora", sets: "3x", reps: "10-15", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira Flexora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_flexora" },
        { name: "Elevação Lateral", sets: "4x", reps: "8-12", image_placeholder: "elevacao_lateral" },
        { name: "Remada Alta", sets: "3x", reps: "10", image_placeholder: "remada_alta" },
        { name: "Desenvolvimento Máquina", sets: "3x", reps: "10-12", image_placeholder: "desenvolvimento_maquina" }
      ]
    },
    sabado: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino reto com halteres", sets: "4x", reps: "10-12", image_placeholder: "supino_halteres" },
        { name: "Supino com Barra", sets: "3x", reps: "12-15", image_placeholder: "supino_barra" },
        { name: "Crucifixo com Halteres", sets: "3x", reps: "12-15", image_placeholder: "crucifixo_halteres" },
        { name: "Supino no banco declinado", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Testa na Polia", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps francês no banco", sets: "3x", reps: "10-12", image_placeholder: "triceps_invertida" }
      ]
    }
  },

  // Semana 3 - Nível Avançado
  3: {
    segunda: { 
      muscle: "Perna / Ombro", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Leg Press", sets: "4x", reps: "10-12", image_placeholder: "leg_press" },
        { name: "Agachamento Livre", sets: "3x", reps: "10-12", image_placeholder: "agachamento" },
        { name: "Cadeira Extensora", sets: "3x", reps: "12-15", image_placeholder: "cadeira_extensora" },
        { name: "Avanço", sets: "3x", reps: "10/10", image_placeholder: "avanco" },
        { name: "Cadeira Abdutora", sets: "3x", reps: "10-15", image_placeholder: "abdutora" },
        { name: "Elevação Lateral", sets: "4x", reps: "10-12", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal", sets: "3x", reps: "10-12", image_placeholder: "elevacao_frontal" },
        { name: "Desenvolvimento Máquina", sets: "3x", reps: "10-12", image_placeholder: "desenvolvimento_maquina" }
      ]
    },
    terca: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino Reto", sets: "4x", reps: "10-12", image_placeholder: "supino_reto" },
        { name: "Supino Inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino na Polia", sets: "3x", reps: "8-10", image_placeholder: "supino_polia" },
        { name: "Crucifixo Polia", sets: "3x", reps: "10-12", image_placeholder: "crucifixo_polia" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Coice", sets: "3x", reps: "8-10", image_placeholder: "triceps_coice" },
        { name: "Tríceps Corda", sets: "4x", reps: "10-12", image_placeholder: "triceps_corda" }
      ]
    },
    quarta: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Puxada Alta Aberta", sets: "4x", reps: "10", image_placeholder: "puxada_alta_aberta" },
        { name: "Remada Baixa", sets: "3x", reps: "8-10", image_placeholder: "remada_baixa" },
        { name: "Remada Baixa Barra", sets: "3x", reps: "10-15", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta Fechada", sets: "4x", reps: "10-12", image_placeholder: "puxada_fechada" },
        { name: "Bíceps na Barra", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps Alternado", sets: "3x", reps: "10-12", image_placeholder: "biceps_alternado" },
        { name: "Rosca Scott Máquina", sets: "3x", reps: "10-12", image_placeholder: "rosca_scott" }
      ]
    },
    quinta: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino Reto", sets: "4x", reps: "10-12", image_placeholder: "supino_reto" },
        { name: "Supino Inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino na Polia", sets: "3x", reps: "8-10", image_placeholder: "supino_polia" },
        { name: "Crucifixo Polia", sets: "3x", reps: "10-12", image_placeholder: "crucifixo_polia" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Coice", sets: "3x", reps: "8-10", image_placeholder: "triceps_coice" },
        { name: "Tríceps Corda", sets: "4x", reps: "10-12", image_placeholder: "triceps_corda" }
      ]
    },
    sexta: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Puxada Alta Aberta", sets: "4x", reps: "10", image_placeholder: "puxada_alta_aberta" },
        { name: "Remada Baixa", sets: "3x", reps: "8-10", image_placeholder: "remada_baixa" },
        { name: "Remada Baixa Barra", sets: "3x", reps: "10-15", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta Fechada", sets: "4x", reps: "10-12", image_placeholder: "puxada_fechada" },
        { name: "Bíceps na Barra", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps Alternado", sets: "3x", reps: "10-12", image_placeholder: "biceps_alternado" },
        { name: "Rosca Scott Máquina", sets: "3x", reps: "10-12", image_placeholder: "rosca_scott" }
      ]
    },
    sabado: { 
      muscle: "Perna / Ombro", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento", sets: "4x", reps: "10-12", image_placeholder: "agachamento" },
        { name: "Stiff", sets: "3x", reps: "12-15", image_placeholder: "stiff" },
        { name: "Mesa Flexora", sets: "3x", reps: "10-12", image_placeholder: "mesa_flexora" },
        { name: "Cadeira Flexora", sets: "3x", reps: "10/10", image_placeholder: "cadeira_flexora" },
        { name: "Panturrilha", sets: "4x", reps: "10", image_placeholder: "panturrilha" },
        { name: "Elevação Lateral", sets: "4x", reps: "8-10", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal", sets: "3x", reps: "10-12", image_placeholder: "elevacao_frontal" },
        { name: "Desenvolvimento Máquina", sets: "3x", reps: "10-12", image_placeholder: "desenvolvimento_maquina" }
      ]
    }
  },

  // Planilha 5 - Feminino | Inferiores (ABC)
  5: {
    segunda: { 
      muscle: "Treino A — Quadríceps (Anterior)", 
      icon: "🦵",
      restTime: "45-60 segundos",
      exercises: [
        { name: "Leg press 45", sets: "4x", reps: "10", image_placeholder: "p5_leg_press_45" },
        { name: "Elevação da coxa em pé", sets: "4x", reps: "10", image_placeholder: "p5_elevacao_coxa_pe" },
        { name: "Adutor na polia em pé ou abdução na máquina", sets: "4x", reps: "10", image_placeholder: "p5_adutor_polia" },
        { name: "Cadeira extensora", sets: "4x", reps: "10", image_placeholder: "p5_cadeira_extensora" },
        { name: "Avanço parado", sets: "4x", reps: "10", image_placeholder: "p5_avanco_parado" },
        { name: "Subida no banco", sets: "4x", reps: "10", image_placeholder: "p5_subida_banco" }
      ]
    },
    terca: { 
      muscle: "Descanso", 
      icon: "😴",
      restTime: "N/A",
      exercises: []
    },
    quarta: { 
      muscle: "Treino B — Posterior + Glúteos", 
      icon: "🍑",
      restTime: "45-60 segundos",
      exercises: [
        { name: "Agachamento livre (fem)", sets: "4x", reps: "10", image_placeholder: "p5_agachamento_livre" },
        { name: "Stiff (fem)", sets: "4x", reps: "10", image_placeholder: "p5_stiff" },
        { name: "Mesa flexora (fem)", sets: "4x", reps: "10", image_placeholder: "p5_mesa_flexora" },
        { name: "Elevação pélvica", sets: "4x", reps: "10", image_placeholder: "p5_elevacao_pelvica" },
        { name: "Cadeira abdutora", sets: "4x", reps: "10", image_placeholder: "p5_cadeira_abdutora" },
        { name: "Extensão de quadril no solo (quatro apoios)", sets: "4x", reps: "10", image_placeholder: "p5_extensao_quadril_solo" },
        { name: "Panturrilha em pé (fem)", sets: "4x", reps: "10", image_placeholder: "p5_panturrilha_pe" }
      ]
    },
    quinta: { 
      muscle: "Descanso", 
      icon: "😴",
      restTime: "N/A",
      exercises: []
    },
    sexta: { 
      muscle: "Treino C — Posterior + Anterior", 
      icon: "🦵",
      restTime: "45-60 segundos",
      exercises: [
        { name: "Leg press 45 (fem)", sets: "4x", reps: "10", image_placeholder: "p5_leg_press_45_c" },
        { name: "Cadeira extensora (fem)", sets: "4x", reps: "10", image_placeholder: "p5_cadeira_extensora_c" },
        { name: "Avanço parado (fem)", sets: "4x", reps: "10", image_placeholder: "p5_avanco_parado_c" },
        { name: "Stiff (fem C)", sets: "4x", reps: "10", image_placeholder: "p5_stiff_c" },
        { name: "Mesa flexora (fem C)", sets: "4x", reps: "10", image_placeholder: "p5_mesa_flexora_c" },
        { name: "Extensão de quadril no solo ou na polia", sets: "4x", reps: "10", image_placeholder: "p5_extensao_quadril_polia" },
        { name: "Panturrilha em pé (fem C)", sets: "4x", reps: "10", image_placeholder: "p5_panturrilha_pe_c" }
      ]
    },
    sabado: { 
      muscle: "Descanso", 
      icon: "😴",
      restTime: "N/A",
      exercises: []
    }
  }
  };

  const weekPlan = weekPlans[weekNumber] || weekPlans[1];

  const weekTitles = {
    1: { title: "Planilha 1 - Nível Iniciante", subtitle: "Treino completo com foco em fundamentos" },
    2: { title: "Planilha 2 - Nível Intermediário", subtitle: "Evolução com treinos mais intensos" },
    3: { title: "Planilha 3 - Nível Avançado", subtitle: "Alta intensidade e volume aumentado" },
    4: { title: "Planilha 4 - Nível Expert", subtitle: "Máxima performance e técnicas avançadas" },
    5: { title: "Planilha 5 - Feminino | Inferiores (ABC)", subtitle: "Treino focado em glúteos e pernas - 3x na semana" }
  };

  const currentWeekInfo = weekTitles[weekNumber] || weekTitles[1];

  const days = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dayLabels = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado"
  };

  const getDayStatus = (day) => {
    const workout = dailyWorkouts.find(w => w.day_of_week === day);
    return workout?.completed || false;
  };

  const toggleExpand = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const openPRModal = (exerciseName) => {
    setSelectedPRExercise(exerciseName);
    setPRModalOpen(true);
  };

  const savePRMutation = useMutation({
    mutationFn: async (prData) => {
      console.log('[WeeklyPlan] Salvando PR:', selectedPRExercise, prData);
      return db.PRRecord.create({
        user_email: user.email,
        exercise_id: selectedPRExercise,
        exercise_name: selectedPRExercise,
        peso_kg: parseFloat(prData.weight_kg),
        repeticoes: parseInt(prData.reps),
        observacao: prData.notes || "",
        data_pr: prData.pr_date
      });
    },
    onSuccess: () => {
      console.log('[WeeklyPlan] PR salvo com sucesso');
      queryClient.invalidateQueries(['prRecords']);
      setPRModalOpen(false);
    },
    onError: (error) => {
      console.error('[WeeklyPlan] Erro ao salvar PR:', error);
      alert('Erro ao salvar recorde pessoal. Tente novamente.');
    },
  });

  const handleSavePR = async (prData) => {
    await savePRMutation.mutateAsync(prData);
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* PR Modal */}
      <PRModal
        isOpen={prModalOpen}
        onClose={() => setPRModalOpen(false)}
        exerciseName={selectedPRExercise}
        onSave={handleSavePR}
        currentPR={selectedPRExercise ? prMap[selectedPRExercise] : null}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{currentWeekInfo.title}</h2>
          <p className="text-[#CEEDB2]">{currentWeekInfo.subtitle}</p>
        </div>
        <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0 px-4 py-2">
          {dailyWorkouts.filter(d => d.completed).length}/6 concluídos
        </Badge>
      </div>

      {days.map((day, index) => {
        const dayPlan = weekPlan[day];
        const isCompleted = getDayStatus(day);
        const isExpanded = expandedDay === day;

        return (
          <motion.div
            key={day}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`glass-effect overflow-hidden transition-all ${
              isCompleted ? 'border-green-500/30' : 'border-[#CEF17B]/20'
            }`}>
              {/* Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(day)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-500/20' : 'bg-[#CEF17B]/20'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <span className="text-2xl">{dayPlan.icon}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white">{dayLabels[day]}</h3>
                        {isCompleted && (
                          <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">
                            Concluído ✓
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#CEF17B] font-semibold">{dayPlan.muscle}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#CEEDB2]">
                        <Clock className="w-3 h-3" />
                        <span>Descanso: {dayPlan.restTime}</span>
                        <span>•</span>
                        <span>{dayPlan.exercises.length} exercícios</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-[#CEF17B]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#CEF17B]" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 border-t border-white/10 pt-4">
                      <div className="space-y-3">
                        {dayPlan.exercises.map((exercise, i) => {
                          const hasImage = exerciseImageMap[exercise.name];
                          const isUploading = uploadingExercise === exercise.name;
                          const currentPR = prMap[exercise.name];

                          return (
                            <div 
                              key={i} 
                              className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              {/* Imagem do exercício */}
                              <div className="relative group">
                                {hasImage ? (
                                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                                    <img 
                                      src={hasImage} 
                                      alt={exercise.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => triggerFileInput(exercise.name)}
                                        className="p-1 bg-white/20 rounded hover:bg-white/30"
                                      >
                                        <Upload className="w-3 h-3 text-white" />
                                      </button>
                                      <button
                                        onClick={() => removeImage(exercise.name)}
                                        className="p-1 bg-red-500/50 rounded hover:bg-red-500/70"
                                      >
                                        <X className="w-3 h-3 text-white" />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => triggerFileInput(exercise.name)}
                                    disabled={isUploading}
                                    className="w-14 h-14 rounded-lg bg-[#CEF17B]/10 flex items-center justify-center flex-shrink-0 border border-dashed border-[#CEF17B]/30 hover:border-[#CEF17B] hover:bg-[#CEF17B]/20 transition-all cursor-pointer"
                                  >
                                    {isUploading ? (
                                      <Loader2 className="w-5 h-5 text-[#CEF17B] animate-spin" />
                                    ) : (
                                      <Upload className="w-5 h-5 text-[#CEF17B]/50" />
                                    )}
                                  </button>
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className="font-semibold text-white">{exercise.name}</h4>
                                <p className="text-sm text-[#CEEDB2]">
                                  {exercise.sets} {exercise.reps}
                                </p>
                                {currentPR && (
                                  <p className="text-xs text-orange-400 mt-0.5 flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    PR: {currentPR.peso_kg}kg x {currentPR.repeticoes} reps
                                  </p>
                                )}
                              </div>
                              
                              <Button
                                onClick={() => openPRModal(exercise.name)}
                                size="sm"
                                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 h-8 px-3 text-xs"
                              >
                                <Trophy className="w-3 h-3 mr-1" />
                                PR
                              </Button>
                              
                              <Badge className="bg-[#CEF17B]/10 text-[#CEF17B] border-0 text-xs">
                                {exercise.sets}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-3 bg-[#CEF17B]/10 rounded-lg">
                        <p className="text-sm text-[#CEF17B] text-center">
                          ⏱️ Descanso entre séries: <strong>{dayPlan.restTime}</strong>
                        </p>
                      </div>

                      <Button
                        onClick={() => onCompleteDay ? onCompleteDay(weekNumber, day) : onStartWorkout(weekNumber, day)}
                        disabled={isCompleted}
                        className={`w-full mt-4 ${
                          isCompleted 
                            ? 'bg-white/5 text-white/40 cursor-not-allowed' 
                            : 'gradient-button text-[#084734] hover:opacity-90'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Treino Concluído
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Marcar como Concluído
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}