import React, { useState } from "react";
import * as ai from "@/api/ai";
import { db } from "@/components/supabaseApi";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Brain, Zap, Target, Dumbbell, Clock, MapPin, AlertTriangle,
  ArrowRight, ArrowLeft, CheckCircle, Loader2, Sparkles, X
} from "lucide-react";

const DAY_ORDER = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];

const DAY_ALIASES = {
  segunda: "segunda",
  "segunda-feira": "segunda",
  monday: "segunda",
  terca: "terca",
  terça: "terca",
  "terca-feira": "terca",
  "terça-feira": "terca",
  tuesday: "terca",
  quarta: "quarta",
  "quarta-feira": "quarta",
  wednesday: "quarta",
  quinta: "quinta",
  "quinta-feira": "quinta",
  thursday: "quinta",
  sexta: "sexta",
  "sexta-feira": "sexta",
  friday: "sexta",
  sabado: "sabado",
  sábado: "sabado",
  saturday: "sabado",
  domingo: "domingo",
  sunday: "domingo",
};

function resolveDayOfWeek(rawDay, fallbackIndex) {
  if (typeof rawDay === "string") {
    const key = rawDay.trim().toLowerCase();
    if (DAY_ALIASES[key]) return DAY_ALIASES[key];
  }
  return DAY_ORDER[fallbackIndex] || DAY_ORDER[0];
}
const STEPS = [
  { id: "objetivo", title: "Objetivo", icon: Target },
  { id: "frequencia", title: "Frequência", icon: Clock },
  { id: "nivel", title: "Nível", icon: Zap },
  { id: "local", title: "Local", icon: MapPin },
  { id: "tempo", title: "Tempo", icon: Clock },
  { id: "lesao", title: "Lesões", icon: AlertTriangle },
];

const OPTIONS = {
  objetivo: [
    { value: "weight_loss", label: "Emagrecimento", desc: "Queimar gordura e definir o corpo", icon: "🔥" },
    { value: "muscle_gain", label: "Ganho de Massa", desc: "Aumentar volume e força muscular", icon: "💪" },
    { value: "maintenance", label: "Manutenção", desc: "Manter forma e saúde geral", icon: "⚖️" },
  ],
  frequencia: [
    { value: "2", label: "2x por semana", desc: "Ritmo leve, ótimo para iniciantes", icon: "📅" },
    { value: "3", label: "3x por semana", desc: "Equilíbrio ideal entre treino e descanso", icon: "📅" },
    { value: "4", label: "4x por semana", desc: "Alta frequência para resultados acelerados", icon: "📅" },
    { value: "5", label: "5x+ por semana", desc: "Nível avançado, divisão completa", icon: "📅" },
  ],
  nivel: [
    { value: "iniciante", label: "Iniciante", desc: "Menos de 6 meses de treino", icon: "🌱" },
    { value: "intermediario", label: "Intermediário", desc: "6 meses a 2 anos de treino", icon: "⚡" },
    { value: "avancado", label: "Avançado", desc: "Mais de 2 anos com consistência", icon: "🔱" },
  ],
  local: [
    { value: "academia", label: "Academia", desc: "Acesso a todos os equipamentos", icon: "🏋️" },
    { value: "casa", label: "Casa", desc: "Sem equipamentos ou com básicos", icon: "🏠" },
    { value: "ambos", label: "Academia + Casa", desc: "Flexibilidade total", icon: "🔄" },
  ],
  tempo: [
    { value: "30", label: "30 minutos", desc: "Treino rápido e eficiente", icon: "⚡" },
    { value: "45", label: "45 minutos", desc: "Equilíbrio entre volume e tempo", icon: "⏱️" },
    { value: "60", label: "60 minutos", desc: "Treino completo e detalhado", icon: "🕐" },
    { value: "75", label: "75+ minutos", desc: "Máximo volume e detalhe", icon: "🏆" },
  ],
  lesao: [
    { value: "nenhuma", label: "Sem lesões", desc: "Sem restrições físicas", icon: "✅" },
    { value: "joelho", label: "Joelho / Perna", desc: "Evitar agachamentos profundos", icon: "🦵" },
    { value: "ombro", label: "Ombro / Braço", desc: "Movimentos acima da cabeça limitados", icon: "💪" },
    { value: "coluna", label: "Coluna / Lombar", desc: "Evitar cargas axiais pesadas", icon: "🦴" },
  ],
};

export default function AIWorkoutWizard({ userId, onClose, onWorkoutsGenerated }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const queryClient = useQueryClient();

  const stepKey = STEPS[currentStep].id;
  const stepOptions = OPTIONS[stepKey];
  const selectedValue = answers[stepKey];
  const progress = ((currentStep) / STEPS.length) * 100;

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [stepKey]: value };
    setAnswers(newAnswers);

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        generateWorkoutPlan(newAnswers);
      }
    }, 280);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const generateWorkoutPlan = async (answersOverride) => {
    setIsGenerating(true);
    setGenerateError(null);
    const { objetivo, frequencia, nivel, local, tempo, lesao } = answersOverride || answers;

    try {
      const result = await ai.workoutPlan({
        objective: objetivo,
        frequency: frequencia,
        level: nivel,
        place: local,
        time: tempo,
        injuries: lesao,
      });

      setGeneratedPlan(result);
    } catch (err) {
      setGenerateError(err?.message || "Não foi possível gerar o plano. Tente novamente.");
      setCurrentStep(STEPS.length - 1);
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async () => {
    if (!generatedPlan || !userId) {
      toast.error("Não foi possível aplicar o plano. Faça login novamente.");
      return;
    }
    setIsSaving(true);

    try {
      const usedDays = new Set();

      for (let i = 0; i < generatedPlan.workouts.length; i++) {
        const workout = generatedPlan.workouts[i];
        let dayOfWeek = resolveDayOfWeek(workout.day_of_week, i);
        if (usedDays.has(dayOfWeek)) {
          dayOfWeek = DAY_ORDER.find((day) => !usedDays.has(day)) || dayOfWeek;
        }
        usedDays.add(dayOfWeek);

        const savedWorkout = await db.CustomWorkout.create({
          user_id: userId,
          nome_treino: workout.name,
          dia_semana: dayOfWeek,
          observacoes: `${generatedPlan.plan_name} • ${workout.muscle_group} • ${workout.intensity} • ${workout.duration_minutes}min | Gerado por IA`,
          source: "ai",
        });

        if (!savedWorkout?.id) {
          throw new Error("Falha ao salvar treino no banco de dados");
        }

        for (let j = 0; j < (workout.exercises || []).length; j++) {
          const ex = workout.exercises[j];
          await db.CustomWorkoutExercise.create({
            custom_workout_id: savedWorkout.id,
            exercise_name: ex.name,
            series: String(ex.sets ?? ""),
            repeticoes: String(ex.reps ?? ""),
            observacoes: `Descanso: ${ex.rest_seconds}s | ${ex.notes || ""}`,
            ordem: j,
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ["customWorkouts"] });
      await queryClient.invalidateQueries({ queryKey: ["customWorkoutExercises"] });
      toast.success("Plano aplicado aos seus treinos");
      onWorkoutsGenerated?.({
        planName: generatedPlan.plan_name,
        workoutCount: generatedPlan.workouts.length,
      });
      onClose();
    } catch (err) {
      console.error("[AIWorkoutWizard] apply plan failed", err);
      toast.error(err?.message || "Não foi possível aplicar o plano. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const intensityXP = { leve: 30, moderado: 60, intenso: 100 };

  // GENERATED PLAN VIEW
  if (generatedPlan) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-4 pb-4 overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 28 }}
          className="w-full max-w-2xl my-0 bg-gradient-to-br from-[#0a3d2e] to-[#062A1F] rounded-3xl border border-[#CEF17B]/20 max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                <Sparkles className="w-3 h-3 mr-1" /> Plano gerado pela IA
              </Badge>
              <button onClick={onClose} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{generatedPlan.plan_name}</h2>
            <p className="text-[#CEEDB2] text-sm mb-6">{generatedPlan.plan_description}</p>

            <div className="space-y-4 mb-6">
              {generatedPlan.workouts.map((workout, i) => (
                <Card key={i} className="bg-white/5 border-[#CEF17B]/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#CEF17B]/20 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-[#CEF17B]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{workout.name}</h3>
                        <p className="text-[#CEEDB2] text-xs">{workout.muscle_group} • {workout.duration_minutes}min</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`border-0 text-xs ${
                        workout.intensity === "intenso" ? "bg-red-500/20 text-red-300" :
                        workout.intensity === "moderado" ? "bg-orange-500/20 text-orange-300" :
                        "bg-green-500/20 text-green-300"
                      }`}>
                        {workout.intensity}
                      </Badge>
                      <p className="text-[#CEF17B] text-xs mt-1 font-bold">+{intensityXP[workout.intensity] || 60} XP</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {workout.exercises.map((ex, j) => (
                      <div key={j} className="flex items-start gap-2 text-xs">
                        <div className="w-1 h-1 rounded-full bg-[#CEF17B] mt-1.5 flex-shrink-0" />
                        <span className="text-white font-medium">{ex.name}</span>
                        <span className="text-[#CEEDB2] ml-auto flex-shrink-0">{ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={savePlan}
                disabled={isSaving}
                className="flex-1 bg-[#CEF17B] hover:bg-[#CEF17B]/90 text-[#084734] font-bold py-6"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Aplicando...</>
                ) : (
                  <><CheckCircle className="w-4 h-4 mr-2" /> Aplicar ao meu plano</>
                )}
              </Button>
              <Button
                onClick={() => setGeneratedPlan(null)}
                variant="outline"
                className="border-[#CEF17B]/20 text-white hover:bg-white/10"
              >
                Refazer
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // GENERATING VIEW
  if (isGenerating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-[#CEF17B] animate-pulse" />
          </div>
          <h3 className="text-white text-xl font-bold">Personal Trainer IA</h3>
          <p className="text-[#CEEDB2]">Criando seu plano personalizado...</p>
          <div className="flex gap-1 justify-center">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[#CEF17B]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // WIZARD STEPS VIEW
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-4 pb-4 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 28 }}
        className="w-full max-w-2xl my-0 bg-gradient-to-br from-[#0a3d2e] to-[#062A1F] rounded-3xl border border-[#CEF17B]/20 max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#CEF17B]" />
              <span className="text-white font-bold">Personal Trainer IA</span>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-[#CEEDB2] mb-2">
              <span>Etapa {currentStep + 1} de {STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#CEF17B] rounded-full"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex gap-1 mt-2">
              {STEPS.map((step, i) => (
                <div
                  key={step.id}
                  className={`flex-1 h-0.5 rounded-full transition-colors ${
                    i <= currentStep ? "bg-[#CEF17B]" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          {generateError && (
            <div className="mb-4 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {generateError}
            </div>
          )}

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={stepKey}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-xl font-bold text-white mb-1">
                {stepKey === "objetivo" && "Qual seu objetivo principal?"}
                {stepKey === "frequencia" && "Quantas vezes você treina por semana?"}
                {stepKey === "nivel" && "Qual seu nível de condicionamento?"}
                {stepKey === "local" && "Onde você vai treinar?"}
                {stepKey === "tempo" && "Quanto tempo você tem por treino?"}
                {stepKey === "lesao" && "Você tem alguma lesão ou restrição?"}
              </h2>
              <p className="text-[#CEEDB2] text-sm mb-5">Selecione a opção que melhor descreve você</p>

              <div className="space-y-3">
                {stepOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedValue === option.value
                        ? "border-[#CEF17B] bg-[#CEF17B]/15"
                        : "border-white/10 bg-white/5 hover:border-[#CEF17B]/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-white">{option.label}</p>
                        <p className="text-xs text-[#CEEDB2]">{option.desc}</p>
                      </div>
                      {selectedValue === option.value && (
                        <CheckCircle className="w-5 h-5 text-[#CEF17B] flex-shrink-0" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation — only back button, flow is automatic */}
          <div className="flex gap-3 mt-6">
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="border-[#CEF17B]/20 text-white hover:bg-white/10 px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}