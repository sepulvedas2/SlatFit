import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import DailyChecklist from "../components/nutrition/DailyChecklist";
import AIFeedback from "../components/nutrition/AIFeedback";
import RegisterDayModal from "../components/nutrition/RegisterDayModal";
import LearningCards from "../components/nutrition/LearningCards";
import ProgressStats from "../components/nutrition/ProgressStats";

export default function SmartNutrition() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CEF17B]" />
      </div>
    );
  }

  // Show message if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <p className="text-white">Por favor, faça login para acessar esta página.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Nutrição Inteligente
          </h1>
          <p className="text-[#CEEDB2]">
            Educação + Consciência + Performance
          </p>
        </div>

        {/* 1. Daily Checklist - TOP */}
        <DailyChecklist userEmail={user.email} />

        {/* 2. AI Feedback */}
        <AIFeedback userEmail={user.email} />

        {/* 3. Learning Section */}
        <LearningCards />

        {/* 4. Progress Stats */}
        <ProgressStats userEmail={user.email} />

        {/* 5. Final Quote */}
        <Card className="glass-effect p-6 border-[#CEF17B]/20 text-center">
          <Lightbulb className="w-12 h-12 text-[#CEF17B] mx-auto mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2">
            "Entender o que você come é mais importante do que contar calorias."
          </h3>
          <p className="text-sm text-[#CEEDB2]">
            — Seu Personal IA
          </p>
        </Card>

        {/* FAB Button - Register Day */}
        <button
          onClick={() => setShowRegisterModal(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full gradient-button text-[#084734] shadow-lg hover:scale-110 transition-transform z-50"
        >
          <Plus className="w-6 h-6 mx-auto" />
        </button>

        {/* Register Day Modal */}
        <RegisterDayModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          userEmail={user.email}
        />

      </div>
    </div>
  );
}