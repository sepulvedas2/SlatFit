import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, ChevronRight } from "lucide-react";
import ExerciseDetailModal from "./ExerciseDetailModal";

export default function ExerciseBlock({ block, exercises = [] }) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
            // Try to find matching exercise data from database
            const exerciseData = exercises.find(e => e.name === exercise.name) || exercise;
            
            return (
              <button
                key={index}
                onClick={() => handleExerciseClick(exerciseData)}
                className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-[#CEF17B]/30 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-[#CEF17B]/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-[#CEF17B] font-bold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-[#CEF17B] transition-colors">
                        {exercise.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#CEEDB2]">
                        <span>{exercise.reps}</span>
                        <span>•</span>
                        <span>{exercise.duration}s</span>
                        {exerciseData.image_url && (
                          <>
                            <span>•</span>
                            <Badge className="bg-green-500/20 text-green-400 border-0 text-xs py-0">
                              Com foto
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#CEF17B] transition-colors" />
                </div>
              </button>
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
          isAdmin={true} // You can make this dynamic based on user role
        />
      )}
    </>
  );
}