import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Scale, Target, TrendingUp } from "lucide-react";
import BodyProgressAvatar from "./BodyProgressAvatar";
import WeightUpdateModal from "./WeightUpdateModal";

function calculateProgress(initialWeight, currentWeight, goalWeight) {
  if (!initialWeight || !currentWeight || !goalWeight || initialWeight === goalWeight) return 0;
  const value = ((initialWeight - currentWeight) / (initialWeight - goalWeight)) * 100;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function BodyProgressSection({ user, profileData }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    base44.functions.invoke("setupDatabase", {}).finally(() => setDbReady(true));
  }, [user?.id]);

  const { data: history = [] } = useQuery({
    queryKey: ["bodyProgress", user?.id],
    queryFn: () => db.UserBodyProgress.filter({ user_id: user.id }, "-created_at", 100),
    enabled: !!user?.id && dbReady,
    initialData: [],
  });

  const orderedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [history]
  );

  const firstRecord = orderedHistory[0];
  const latestRecord = orderedHistory[orderedHistory.length - 1];
  const initialWeight = firstRecord?.weight_initial || profileData?.current_weight || 0;
  const currentWeight = latestRecord?.weight_current || profileData?.current_weight || 0;
  const goalWeight = latestRecord?.weight_goal || profileData?.target_weight || 0;
  const progressPercent = calculateProgress(initialWeight, currentWeight, goalWeight);

  const chartData = orderedHistory.length > 0
    ? orderedHistory.map((item) => ({ date: format(new Date(item.created_at), "dd/MM"), weight: Number(item.weight_current) }))
    : currentWeight
      ? [{ date: "Hoje", weight: Number(currentWeight) }]
      : [];

  const saveMutation = useMutation({
    mutationFn: ({ weightCurrent, weightGoal }) => {
      const now = new Date().toISOString();
      return db.UserBodyProgress.create({
        user_id: user.id,
        weight_initial: firstRecord?.weight_initial || profileData?.current_weight || weightCurrent,
        weight_current: weightCurrent,
        weight_goal: weightGoal,
        created_at: now,
        updated_at: now,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["bodyProgress"]);
      setShowModal(false);
    },
  });

  return (
    <>
      <Card className="glass-effect rounded-2xl p-5 border border-[#CEF17B]/20" style={{ backgroundColor: "rgba(22,42,40,0.8)" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="text-white font-bold">Progresso Corporal</h3>
        </div>

        <BodyProgressAvatar gender={profileData?.gender} />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-2xl p-4 bg-white/5">
            <p className="text-[#A0B5B2] text-xs mb-1">Peso atual</p>
            <p className="text-white text-2xl font-black">{currentWeight || "—"} <span className="text-sm font-semibold text-[#CEEDB2]">kg</span></p>
          </div>
          <div className="rounded-2xl p-4 bg-white/5">
            <p className="text-[#A0B5B2] text-xs mb-1">Objetivo</p>
            <p className="text-white text-2xl font-black">{goalWeight || "—"} <span className="text-sm font-semibold text-[#CEEDB2]">kg</span></p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl p-4 bg-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-white text-sm font-semibold">Progresso</p>
            <p className="text-[#CEF17B] text-sm font-bold">{progressPercent}%</p>
          </div>
          <Progress value={progressPercent} className="h-3 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-[#CEF17B] [&>div]:to-green-400" />
          <div className="flex items-center justify-between text-xs text-[#A0B5B2]">
            <span>Inicial: {initialWeight || "—"} kg</span>
            <span>Meta: {goalWeight || "—"} kg</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl p-4 bg-white/5">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-[#CEF17B]" />
            <p className="text-white text-sm font-semibold">Gráfico de evolução do peso</p>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fill: "#A0B5B2", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#A0B5B2", fontSize: 10 }} axisLine={false} tickLine={false} width={34} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#162A28", border: "1px solid rgba(206,241,123,0.2)", borderRadius: 12 }}
                  formatter={(value) => [`${value} kg`, "Peso"]}
                />
                <Line type="monotone" dataKey="weight" stroke="#CEF17B" strokeWidth={3} dot={{ r: 4, fill: "#CEF17B" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <Button onClick={() => setShowModal(true)} className="w-full mt-4 bg-[#CEF17B] text-[#084734] hover:bg-[#b8e05a] font-bold h-12">
          Atualizar peso
        </Button>
      </Card>

      <WeightUpdateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={(payload) => saveMutation.mutate(payload)}
        saving={saveMutation.isPending}
        defaultCurrentWeight={currentWeight}
        defaultGoalWeight={goalWeight}
      />
    </>
  );
}