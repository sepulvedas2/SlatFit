import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, Calendar, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { differenceInDays } from "date-fns";

export default function ConstancyAlert({ user, profile, weekWorkouts, lastWorkout }) {
  // SISTEMA PROATIVO DE DETECÇÃO DE ABANDONO
  
  if (!user || !profile) return null;

  const daysSinceLastWorkout = lastWorkout 
    ? differenceInDays(new Date(), new Date(lastWorkout.completed_date))
    : 999;

  const expectedFrequency = profile.training_frequency || 3;
  const currentFrequency = weekWorkouts?.length || 0;
  const missedWorkouts = Math.max(0, expectedFrequency - currentFrequency);

  // Alerta crítico: 5+ dias sem treinar
  if (daysSinceLastWorkout >= 5) {
    return (
      <Card className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-500/40 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Detecção de Inatividade</h3>
            <p className="text-white/90 text-sm mb-3">
              {daysSinceLastWorkout} dias sem treinar. Vamos recomeçar de forma inteligente?
            </p>
            <Link to={createPageUrl("Workouts")}>
              <Button className="w-full bg-red-500 hover:bg-red-600">
                <Zap className="w-4 h-4 mr-2" />
                Treino de Retomada (20 min)
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  }

  // Alerta moderado: Faltando treinos na semana
  if (missedWorkouts >= 2) {
    return (
      <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/40 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/30 flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white mb-1">Constância Abaixo da Meta</h3>
            <p className="text-white/90 text-sm mb-3">
              Você está {missedWorkouts} treino(s) atrás esta semana. Ajustar plano?
            </p>
            <div className="flex gap-2">
              <Link to={createPageUrl("Workouts")} className="flex-1">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                  Manter Plano
                </Button>
              </Link>
              <Link to={createPageUrl("Profile")} className="flex-1">
                <Button variant="outline" className="w-full border-yellow-500/40 text-yellow-400">
                  Ajustar Meta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Alerta leve: 3+ dias sem treinar (mas ainda dentro da semana)
  if (daysSinceLastWorkout >= 3) {
    return (
      <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-white font-semibold text-sm">Hora de Treinar!</p>
              <p className="text-white/80 text-xs">{daysSinceLastWorkout} dias desde o último treino</p>
            </div>
          </div>
          <Link to={createPageUrl("Workouts")}>
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              Treinar
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return null;
}