import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Info, Zap, Target, Dumbbell } from "lucide-react";
import { db } from "@/components/supabaseApi";
import { getPersistentExerciseImage, getPersistentExerciseRecord } from "./resolveExerciseImage";

export default function ExerciseDetailModal({ exercise, isOpen, onClose, isHIIT = false }) {
  const [currentExercise, setCurrentExercise] = useState(exercise || null);
  const [savedExercises, setSavedExercises] = useState([]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!isOpen || !exercise?.name) return;
      const records = await db.Exercise.list();
      setSavedExercises(records || []);
      const persistentRecord = getPersistentExerciseRecord(records || [], exercise.name);
      setCurrentExercise(persistentRecord || exercise);
    };

    loadExercises();
  }, [isOpen, exercise?.name]);

  const difficultyColors = {
    iniciante: "bg-green-500/20 text-green-400 border-green-500/30",
    intermediario: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    avancado: "bg-red-500/20 text-red-400 border-red-500/30"
  };

  const imageUrl = getPersistentExerciseImage(savedExercises, exercise?.name) || currentExercise?.image_url || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#084734] border-[#CEF17B]/20 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-xl">
              {currentExercise?.name || exercise?.name || "Exercício"}
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
          {!isHIIT && (
            <div className="space-y-3">
              <div className="relative w-full aspect-[3/4] max-w-[280px] mx-auto rounded-xl overflow-hidden border-2 border-[#CEF17B]/30 bg-white/5">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={currentExercise?.name || exercise?.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/30">
                    <Dumbbell className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={difficultyColors[currentExercise?.difficulty || "intermediario"]}>
                {currentExercise?.difficulty || "intermediario"}
              </Badge>
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                {currentExercise?.category || "cardio"}
              </Badge>
            </div>

            {currentExercise?.description && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-[#CEF17B]" />
                  <p className="text-white font-semibold text-sm">Como Executar</p>
                </div>
                <p className="text-[#CEEDB2] text-sm leading-relaxed">
                  {currentExercise.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-[#CEF17B]" />
                  <p className="text-white/60 text-xs">Repetições</p>
                </div>
                <p className="text-white font-bold text-lg">{currentExercise?.reps_suggestion || exercise?.reps || "—"}</p>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-[#CEF17B]" />
                  <p className="text-white/60 text-xs">Duração</p>
                </div>
                <p className="text-white font-bold text-lg">{currentExercise?.duration_seconds || exercise?.duration || 0}s</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}