import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import ExerciseCard from "./ExerciseCard";
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
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Badge className="bg-gradient-to-r from-[#0E9E4D] to-[#59F394] text-white border-0 px-4 py-1.5">
            {block.title}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {block.exercises.map((exercise, index) => {
            // Try to find matching exercise data from database
            const exerciseData = exercises.find(e => e.name === exercise.name) || exercise;
            
            return (
              <ExerciseCard
                key={index}
                exercise={exerciseData}
                index={index}
                onClick={() => handleExerciseClick(exerciseData)}
              />
            );
          })}
        </div>
      </div>

      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedExercise(null);
          }}
          isAdmin={true}
        />
      )}
    </>
  );
}