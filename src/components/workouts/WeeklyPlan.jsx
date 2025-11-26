import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Dumbbell, Play, Clock, ChevronDown, ChevronUp, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function WeeklyPlan({ weekNumber, dailyWorkouts = [], onStartWorkout, onCompleteDay }) {
  const [expandedDay, setExpandedDay] = useState(null);

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
        { name: "Supino no banco", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
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
        { name: "Remada baixa", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada alta", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
        { name: "Bíceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps alternado", sets: "3x", reps: "12-15", image_placeholder: "biceps_alternado" },
        { name: "Bíceps martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" }
      ]
    },
    quarta: { 
      muscle: "Pernas", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento", sets: "4x", reps: "8-12", image_placeholder: "agachamento" },
        { name: "Leg press", sets: "3x", reps: "10-15", image_placeholder: "leg_press" },
        { name: "Cadeira extensora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira flexora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_flexora" },
        { name: "Agachamento sumo", sets: "3x", reps: "10-12", image_placeholder: "agachamento_sumo" },
        { name: "Panturrilha", sets: "3x", reps: "12-15", image_placeholder: "panturrilha" }
      ]
    },
    quinta: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada baixa", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada alta", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
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
        { name: "Supino no banco", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
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
        { name: "Elevação lateral", sets: "3x", reps: "10-12", image_placeholder: "elevacao_lateral" },
        { name: "Elevação frontal", sets: "3x", reps: "10-12", image_placeholder: "elevacao_frontal" },
        { name: "Rotação de ombro", sets: "3x", reps: "12-15", image_placeholder: "rotacao_ombro" },
        { name: "Prancha", sets: "3x", reps: "30-60s", image_placeholder: "prancha" },
        { name: "Abdominal infra", sets: "3x", reps: "12-15", image_placeholder: "abdominal_infra" },
        { name: "Abdominal reto", sets: "3x", reps: "10-12", image_placeholder: "abdominal_reto" }
      ]
    }
  },

  // Semana 2 - Nível Intermediário
  2: {
    segunda: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada baixa", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada alta", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
        { name: "Bíceps martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" },
        { name: "Bíceps alternado", sets: "3x", reps: "12-15", image_placeholder: "biceps_alternado" },
        { name: "Bíceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" }
      ]
    },
    terca: { 
      muscle: "Pernas", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento livre", sets: "4x", reps: "8-12", image_placeholder: "agachamento" },
        { name: "Leg press", sets: "3x", reps: "10-15", image_placeholder: "leg_press" },
        { name: "Cadeira extensora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira flexora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_flexora" },
        { name: "Agachamento sumo", sets: "3x", reps: "10-12", image_placeholder: "agachamento_sumo" },
        { name: "Panturrilha", sets: "3x", reps: "10-15", image_placeholder: "panturrilha" }
      ]
    },
    quarta: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Supino no banco", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps corda", sets: "3x", reps: "12-15", image_placeholder: "triceps_corda" },
        { name: "Tríceps pulley", sets: "3x", reps: "12-15", image_placeholder: "triceps_pulley" },
        { name: "Tríceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "triceps_barra" }
      ]
    },
    quinta: { 
      muscle: "Pernas", 
      icon: "🦵",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Agachamento livre", sets: "4x", reps: "8-12", image_placeholder: "agachamento" },
        { name: "Leg press", sets: "3x", reps: "10-15", image_placeholder: "leg_press" },
        { name: "Cadeira extensora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_extensora" },
        { name: "Cadeira flexora", sets: "3x", reps: "10-12", image_placeholder: "cadeira_flexora" },
        { name: "Agachamento sumo", sets: "3x", reps: "10-12", image_placeholder: "agachamento_sumo" },
        { name: "Panturrilha", sets: "3x", reps: "10-15", image_placeholder: "panturrilha" }
      ]
    },
    sexta: { 
      muscle: "Peito / Tríceps", 
      icon: "💪",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Supino inclinado", sets: "3x", reps: "10-15", image_placeholder: "supino_inclinado" },
        { name: "Supino reto", sets: "4x", reps: "8-12", image_placeholder: "supino_reto" },
        { name: "Supino no banco", sets: "3x", reps: "12-15", image_placeholder: "supino_banco" },
        { name: "Tríceps corda", sets: "3x", reps: "12-15", image_placeholder: "triceps_corda" },
        { name: "Tríceps pulley", sets: "3x", reps: "12-15", image_placeholder: "triceps_pulley" },
        { name: "Tríceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "triceps_barra" }
      ]
    },
    sabado: { 
      muscle: "Costas / Bíceps", 
      icon: "🦾",
      restTime: "30-60 segundos",
      exercises: [
        { name: "Remada baixa", sets: "4x", reps: "8-12", image_placeholder: "remada_baixa" },
        { name: "Remada alta", sets: "3x", reps: "10-15", image_placeholder: "remada_alta" },
        { name: "Puxada alta", sets: "3x", reps: "8-12", image_placeholder: "puxada_alta" },
        { name: "Bíceps martelo", sets: "3x", reps: "10-12", image_placeholder: "biceps_martelo" },
        { name: "Bíceps alternado", sets: "3x", reps: "12-15", image_placeholder: "biceps_alternado" },
        { name: "Bíceps barra reta", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" }
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
        { name: "Supino Livre com Halteres", sets: "4x", reps: "10-12", image_placeholder: "supino_halteres" },
        { name: "Supino Livre com Barra", sets: "3x", reps: "12-15", image_placeholder: "supino_barra" },
        { name: "Crucifixo com Halteres", sets: "3x", reps: "12-15", image_placeholder: "crucifixo_halteres" },
        { name: "Supino Unilateral no Banco", sets: "3x", reps: "12-15", image_placeholder: "supino_unilateral" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Testa na Polia", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps Barra Invertida", sets: "3x", reps: "10-12", image_placeholder: "triceps_invertida" }
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
        { name: "Leg Press com Impulso", sets: "3x", reps: "12-15", image_placeholder: "leg_press_impulso" },
        { name: "Cadeira Extensora", sets: "3x", reps: "12-15", image_placeholder: "cadeira_extensora" },
        { name: "Mesa Flexora", sets: "3x", reps: "10-12", image_placeholder: "mesa_flexora" },
        { name: "Desenvolvimento com Halteres", sets: "3x", reps: "10", image_placeholder: "desenvolvimento_halteres" },
        { name: "Remada Alta", sets: "3x", reps: "10", image_placeholder: "remada_alta" },
        { name: "Elevação Unilateral na Polia", sets: "3x", reps: "10", image_placeholder: "elevacao_polia" }
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
        { name: "Agachamento Lateral", sets: "3x", reps: "10-12", image_placeholder: "agachamento_lateral" },
        { name: "Leg Press Unilateral", sets: "3x", reps: "10-15", image_placeholder: "leg_press_unilateral" },
        { name: "Cadeira Extensora Unilateral", sets: "3x", reps: "10-15", image_placeholder: "extensora_unilateral" },
        { name: "Cadeira Flexora Unilateral", sets: "3x", reps: "10-12", image_placeholder: "flexora_unilateral" },
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
        { name: "Supino Livre com Halteres", sets: "4x", reps: "10-12", image_placeholder: "supino_halteres" },
        { name: "Supino Livre com Barra", sets: "3x", reps: "12-15", image_placeholder: "supino_barra" },
        { name: "Crucifixo com Halteres", sets: "3x", reps: "12-15", image_placeholder: "crucifixo_halteres" },
        { name: "Supino Unilateral no Banco", sets: "3x", reps: "12-15", image_placeholder: "supino_unilateral" },
        { name: "Tríceps Mergulho", sets: "3x", reps: "10-12", image_placeholder: "triceps_mergulho" },
        { name: "Tríceps Testa na Polia", sets: "3x", reps: "10-12", image_placeholder: "triceps_testa" },
        { name: "Tríceps Barra Invertida", sets: "3x", reps: "10-12", image_placeholder: "triceps_invertida" }
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
        { name: "Puxada no TRX", sets: "4x", reps: "10", image_placeholder: "puxada_trx" },
        { name: "Remada Baixa Unilateral", sets: "3x", reps: "8-10", image_placeholder: "remada_unilateral" },
        { name: "Remada Baixa Barra", sets: "3x", reps: "10-15", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta Fechada", sets: "4x", reps: "10-12", image_placeholder: "puxada_fechada" },
        { name: "Bíceps na Barra", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps Alternado com Peso", sets: "3x", reps: "10-12", image_placeholder: "biceps_alternado" },
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
        { name: "Puxada no TRX", sets: "4x", reps: "10", image_placeholder: "puxada_trx" },
        { name: "Remada Baixa Unilateral", sets: "3x", reps: "8-10", image_placeholder: "remada_unilateral" },
        { name: "Remada Baixa Barra", sets: "3x", reps: "10-15", image_placeholder: "remada_baixa" },
        { name: "Puxada Alta Fechada", sets: "4x", reps: "10-12", image_placeholder: "puxada_fechada" },
        { name: "Bíceps na Barra", sets: "3x", reps: "10-12", image_placeholder: "biceps_barra" },
        { name: "Bíceps Alternado com Peso", sets: "3x", reps: "10-12", image_placeholder: "biceps_alternado" },
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
        { name: "Cadeira Flexora Unilateral", sets: "3x", reps: "10/10", image_placeholder: "flexora_unilateral" },
        { name: "Panturrilha", sets: "4x", reps: "10", image_placeholder: "panturrilha" },
        { name: "Elevação Lateral", sets: "4x", reps: "8-10", image_placeholder: "elevacao_lateral" },
        { name: "Elevação Frontal", sets: "3x", reps: "10-12", image_placeholder: "elevacao_frontal" },
        { name: "Desenvolvimento Máquina", sets: "3x", reps: "10-12", image_placeholder: "desenvolvimento_maquina" }
      ]
    }
  }
  };

  const weekPlan = weekPlans[weekNumber] || weekPlans[1];

  const weekTitles = {
    1: { title: "Semana 1 - Nível Iniciante", subtitle: "Treino completo com foco em fundamentos" },
    2: { title: "Semana 2 - Nível Intermediário", subtitle: "Evolução com treinos mais intensos" },
    3: { title: "Semana 3 - Nível Avançado", subtitle: "Alta intensidade e volume aumentado" },
    4: { title: "Semana 4 - Nível Expert", subtitle: "Máxima performance e técnicas avançadas" }
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

  return (
    <div className="space-y-4">
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
                        {dayPlan.exercises.map((exercise, i) => (
                          <div 
                            key={i} 
                            className="flex items-center gap-4 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                          >
                            {/* Placeholder para imagem */}
                            <div className="w-14 h-14 rounded-lg bg-[#CEF17B]/10 flex items-center justify-center flex-shrink-0 border border-[#CEF17B]/20">
                              <Image className="w-6 h-6 text-[#CEF17B]/50" />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{exercise.name}</h4>
                              <p className="text-sm text-[#CEEDB2]">
                                {exercise.sets} {exercise.reps}
                              </p>
                            </div>
                            
                            <Badge className="bg-[#CEF17B]/10 text-[#CEF17B] border-0 text-xs">
                              {exercise.sets}
                            </Badge>
                          </div>
                        ))}
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