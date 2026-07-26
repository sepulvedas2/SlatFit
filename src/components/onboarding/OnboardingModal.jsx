import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Target, Activity, User, Ruler, Scale, Camera } from "lucide-react";
import { db } from "@/components/supabaseApi";
import { useMutation } from "@tanstack/react-query";
import ProfileAvatarPicker from "@/components/profile/ProfileAvatarPicker";

const TOTAL_STEPS = 6;

export default function OnboardingModal({ user, isOpen, onComplete }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    height: "",
    current_weight: "",
    target_weight: "",
    age: "",
    gender: "male",
    goal: "weight_loss",
    fitness_level: "Iniciante",
    activity_level: "moderate",
    body_type: "mesomorph",
    avatar_url: null,
    avatar_public_consent_at: null,
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      const height = Number(data.height);
      const currentWeight = Number(data.current_weight);
      const age = Number(data.age);

      const bmr = data.gender === "male"
        ? 10 * currentWeight + 6.25 * height - 5 * age + 5
        : 10 * currentWeight + 6.25 * height - 5 * age - 161;

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      let tdee = bmr * (activityMultipliers[data.activity_level] || 1.55);
      let calories = tdee;
      if (data.goal === "weight_loss") calories = tdee - 500;
      if (data.goal === "muscle_gain") calories = tdee + 300;

      const protein = currentWeight * 2;
      const fats = (calories * 0.25) / 9;
      const carbs = (calories - (protein * 4) - (fats * 9)) / 4;

      return db.UserProfile.create({
        id: user.id,
        user_id: user.id,
        email: user.email,
        display_name: user.full_name || user.email?.split("@")[0] || "Atleta",
        height,
        age,
        weight: currentWeight,
        goal_weight: Number(data.target_weight),
        gender: data.gender,
        objective: data.goal,
        biotype: data.body_type,
        activity_level: data.activity_level,
        fitness_level: data.fitness_level,
        daily_calorie_target: Math.round(calories),
        protein_target: Math.round(protein),
        carbs_target: Math.round(carbs),
        fats_target: Math.round(fats),
        theme_preference: "default",
        avatar_url: data.avatar_url || null,
        avatar_public_consent_at: data.avatar_public_consent_at || null,
      });
    },
    onSuccess: () => {
      onComplete();
    },
  });

  const handleNext = () => {
    if (step < TOTAL_STEPS && validateCurrentStep()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (validateCurrentStep()) {
      createProfileMutation.mutate(formData);
    }
  };

  const validateCurrentStep = () => {
    switch (step) {
      case 1:
        return formData.height && formData.age;
      case 2:
        return formData.current_weight && formData.target_weight;
      case 3:
        return formData.goal;
      case 4:
        return formData.fitness_level;
      case 5:
        return formData.activity_level;
      case 6:
        // Avatar is optional; if URL set, consent must exist
        if (formData.avatar_url && !formData.avatar_public_consent_at) return false;
        return true;
      default:
        return true;
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-md p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
            <motion.div
              className="h-full bg-[#CEF17B]"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <div className="p-8">
            <div className="text-center mb-8 mt-4">
              <h2 className="text-2xl font-bold text-white mb-2">
                Seu Personal Trainer Digital
              </h2>
              <p className="text-[#CEEDB2]">
                Vamos criar seu plano personalizado — passo {step} de {TOTAL_STEPS}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Informações Básicas
                  </h3>

                  <div>
                    <Label className="text-[#CEEDB2] mb-2 block">Gênero</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => updateField("gender", "male")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.gender === "male"
                            ? "border-[#CEF17B] bg-[#CEF17B]/10"
                            : "border-white/10 hover:border-[#CEF17B]/50"
                        }`}
                      >
                        <span className="text-white font-semibold">Masculino</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField("gender", "female")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.gender === "female"
                            ? "border-[#CEF17B] bg-[#CEF17B]/10"
                            : "border-white/10 hover:border-[#CEF17B]/50"
                        }`}
                      >
                        <span className="text-white font-semibold">Feminino</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-[#CEEDB2] mb-2 block">Idade</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 25"
                      value={formData.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-lg h-14"
                    />
                  </div>

                  <div>
                    <Label className="text-[#CEEDB2] mb-2 block">Altura (cm)</Label>
                    <div className="relative">
                      <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#CEF17B]/50" />
                      <Input
                        type="number"
                        placeholder="Ex: 175"
                        value={formData.height}
                        onChange={(e) => updateField("height", e.target.value)}
                        className="bg-white/5 border-white/10 text-white text-lg h-14 pl-12"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Seu Peso
                  </h3>

                  <div>
                    <Label className="text-[#CEEDB2] mb-2 block">Peso Atual (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 80"
                      value={formData.current_weight}
                      onChange={(e) => updateField("current_weight", e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-lg h-14"
                    />
                  </div>

                  <div>
                    <Label className="text-[#CEEDB2] mb-2 block">Peso Desejado (kg)</Label>
                    <Input
                      type="number"
                      placeholder="Ex: 75"
                      value={formData.target_weight}
                      onChange={(e) => updateField("target_weight", e.target.value)}
                      className="bg-white/5 border-white/10 text-white text-lg h-14"
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Qual seu objetivo?
                  </h3>

                  <div className="space-y-3">
                    {[
                      { value: "weight_loss", label: "Perder Peso", desc: "Queimar gordura e definir" },
                      { value: "muscle_gain", label: "Ganhar Massa", desc: "Hipertrofia muscular" },
                      { value: "maintenance", label: "Manter Peso", desc: "Estabilizar e tonificar" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => updateField("goal", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.goal === option.value
                            ? "border-[#CEF17B] bg-[#CEF17B]/10"
                            : "border-white/10 hover:border-[#CEF17B]/50"
                        }`}
                      >
                        <div className="text-white font-semibold">{option.label}</div>
                        <div className="text-[#CEEDB2] text-sm">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Qual seu nível de treino?
                  </h3>

                  <div className="space-y-3">
                    {[
                      { value: "Iniciante", label: "Iniciante", desc: "Pouca ou nenhuma experiência com treinos" },
                      { value: "Intermediário", label: "Intermediário", desc: "Treino regular há alguns meses" },
                      { value: "Avançado", label: "Avançado", desc: "Treino consistente há mais de 1 ano" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => updateField("fitness_level", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.fitness_level === option.value
                            ? "border-[#CEF17B] bg-[#CEF17B]/10"
                            : "border-white/10 hover:border-[#CEF17B]/50"
                        }`}
                      >
                        <div className="text-white font-semibold">{option.label}</div>
                        <div className="text-[#CEEDB2] text-sm">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white text-center mb-6">
                    Frequência Semanal
                  </h3>

                  <div className="space-y-3">
                    {[
                      { value: "sedentary", label: "Sedentário", desc: "Pouco ou nenhum exercício" },
                      { value: "light", label: "Leve", desc: "Exercício 1-3x por semana" },
                      { value: "moderate", label: "Moderado", desc: "Exercício 3-5x por semana" },
                      { value: "active", label: "Ativo", desc: "Exercício 6-7x por semana" },
                      { value: "very_active", label: "Muito Ativo", desc: "Exercício 2x por dia" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        onClick={() => updateField("activity_level", option.value)}
                        className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                          formData.activity_level === option.value
                            ? "border-[#CEF17B] bg-[#CEF17B]/10"
                            : "border-white/10 hover:border-[#CEF17B]/50"
                        }`}
                      >
                        <div className="text-white font-semibold">{option.label}</div>
                        <div className="text-[#CEEDB2] text-sm">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="space-y-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[#CEF17B]/20 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-[#CEF17B]" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    Foto de perfil
                  </h3>
                  <p className="text-sm text-[#CEEDB2] mb-4">
                    Opcional. Se adicionar, ela poderá aparecer no Ranking Global.
                  </p>

                  <div className="flex flex-col items-center">
                    <ProfileAvatarPicker
                      avatarUrl={formData.avatar_url}
                      name={user?.full_name || user?.email}
                      hasConsent={!!formData.avatar_public_consent_at}
                      showRemove
                      onChange={(next) => {
                        setFormData((prev) => ({
                          ...prev,
                          avatar_url: next.avatar_url ?? null,
                          avatar_public_consent_at:
                            next.avatar_public_consent_at ?? prev.avatar_public_consent_at,
                        }));
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-white/10 hover:bg-white/5"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              )}

              {step < TOTAL_STEPS ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!validateCurrentStep()}
                  className="flex-1 gradient-button text-[#084734]"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || createProfileMutation.isPending}
                  className="flex-1 gradient-button text-[#084734]"
                >
                  {createProfileMutation.isPending ? "Criando seu plano..." : "Começar!"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
