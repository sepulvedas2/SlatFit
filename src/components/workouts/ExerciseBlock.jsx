import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, ChevronRight, Trophy } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";
import { getExerciseImage } from "./exerciseImages";
import PRModal from "./PRModal";

export default function ExerciseBlock({ block, exercises = [] }) {
  const [user, setUser] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [prModalOpen, setPrModalOpen] = useState(false);
  const [selectedExerciseForPR, setSelectedExerciseForPR] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: prRecords = [] } = useQuery({
    queryKey: ['prRecords', user?.email],
    queryFn: () => db.PRRecord.filter({ user_email: user.email }),
    enabled: !!user?.email,
    initialData: [],
  });

  const getLatestPR = (exerciseName) => {
    const exercisePRs = prRecords.filter(pr => pr.exercise_name === exerciseName);
    if (exercisePRs.length === 0) return null;
    return exercisePRs.sort((a, b) => new Date(b.data_pr) - new Date(a.data_pr))[0];
  };

  const handleOpenPRModal = (e, exercise) => {
    e.stopPropagation();
    setSelectedExerciseForPR(exercise);
    setPrModalOpen(true);
  };

  const handleExerciseClick = (exerciseData) => {
    setSelectedExercise(exerciseData);
    setShowModal(true);
  };

  return (
    <>
      <Card className="glass-effect border-[#CEF17B]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
            {block.title}
          </Badge>
        </div>

        <div className="space-y-3">
          {block.exercises.map((exercise, index) => {
            const exerciseData = exercises.find(e => e.name === exercise.name) || exercise;
            const latestPR = getLatestPR(exercise.name);
            
            return (
              <div
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-[#CEF17B]/30 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleExerciseClick(exerciseData)}
                    className="flex items-center gap-3 flex-1 text-left group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#CEF17B]/20">
                      <img
                        src={exerciseData.image_url || getExerciseImage(exercise.name)}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = getExerciseImage(exercise.name); }}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-[#CEF17B] transition-colors">
                        {exercise.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#CEEDB2]">
                        <span>{exercise.reps}</span>
                        <span>•</span>
                        <span>{exercise.duration}s</span>
                      </div>
                      {latestPR && (
                        <p className="text-xs text-[#CEF17B] mt-1 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          Último PR: {latestPR.peso_kg}kg x {latestPR.repeticoes} reps
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#CEF17B] transition-colors" />
                  </button>

                  <Button
                    size="sm"
                    onClick={(e) => handleOpenPRModal(e, { id: `ex_${index}`, name: exercise.name })}
                    className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 text-xs h-8 px-3 flex-shrink-0"
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    PR
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Clock className="w-4 h-4" />
            <span>Descanso de 10 segundos entre exercícios</span>
          </div>
        </div>
      </Card>

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedExercise(null);
          }}
          isAdmin={true}
          isHIIT={true}
        />
      )}

      {prModalOpen && selectedExerciseForPR && (
        <PRModal
          isOpen={prModalOpen}
          onClose={() => {
            setPrModalOpen(false);
            setSelectedExerciseForPR(null);
          }}
          exercise={selectedExerciseForPR}
          userEmail={user?.email}
        />
      )}
    </>
  );
}