import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

export default function ExerciseBlock({ block }) {
  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <h3 className="text-xl font-bold text-white mb-4">{block.title}</h3>
      
      <div className="space-y-3">
        {block.exercises.map((exercise, index) => (
          <div 
            key={index}
            className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#CEF17B]/20 flex items-center justify-center flex-shrink-0">
              <span className="text-[#CEF17B] font-bold text-sm">{index + 1}</span>
            </div>
            
            <div className="flex-1">
              <p className="text-white font-semibold">{exercise.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[#CEEDB2] text-xs">
                  {exercise.reps}
                </Badge>
                <Badge variant="outline" className="bg-white/5 border-white/10 text-[#CEEDB2] text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {exercise.duration}s
                </Badge>
              </div>
            </div>

            <CheckCircle className="w-5 h-5 text-white/20" />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <p className="text-xs text-blue-300 text-center">
          💧 Descanso de 10s entre cada exercício
        </p>
      </div>
    </Card>
  );
}