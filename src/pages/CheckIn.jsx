import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Battery, Moon, AlertCircle, 
  Smile, Meh, Frown, Zap, Coffee,
  ArrowLeft, Loader2, Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function CheckIn() {
  const [user, setUser] = useState(null);
  const [checkInData, setCheckInData] = useState({
    energy_level: 3,
    mood: "ok",
    sleep_quality: 3,
    pain_areas: [],
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState("");

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayCheckIn } = useQuery({
    queryKey: ['checkIn', user?.email, today],
    queryFn: async () => {
      const checkIns = await db.DailyCheckIn.filter({
        user_email: user.email,
        check_in_date: today
      });
      return checkIns[0] || null;
    },
    enabled: !!user?.email
  });

  const moodOptions = [
    { value: "great", label: "Ótimo", icon: Smile, color: "text-green-400" },
    { value: "good", label: "Bom", icon: Smile, color: "text-blue-400" },
    { value: "ok", label: "Ok", icon: Meh, color: "text-yellow-400" },
    { value: "tired", label: "Cansado", icon: Coffee, color: "text-orange-400" },
    { value: "stressed", label: "Estressado", icon: Frown, color: "text-red-400" }
  ];

  const painAreas = [
    "Pescoço", "Ombros", "Costas", "Lombar", 
    "Joelhos", "Pernas", "Braços", "Nenhuma"
  ];

  const generateAIRecommendation = async () => {
    const { energy_level, mood, sleep_quality } = checkInData;
    
    try {
      const recommendation = await base44.integrations.Core.InvokeLLM({
        prompt: `Como coach de fitness, analise este check-in diário e dê UMA recomendação curta e motivadora (máximo 2 linhas):
        
        Energia: ${energy_level}/5
        Humor: ${mood}
        Sono: ${sleep_quality}/5
        
        Seja empático, prático e motivador. Sugira ajuste no treino se necessário.`,
        add_context_from_internet: false
      });
      
      setAiRecommendation(recommendation);
      return recommendation;
    } catch (err) {
      return "Continue firme! Cada dia é uma oportunidade de evoluir. 💪";
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    
    const recommendation = await generateAIRecommendation();
    
    try {
      if (todayCheckIn) {
        await db.DailyCheckIn.update(todayCheckIn.id, {
          ...checkInData,
          ai_recommendation: recommendation
        });
      } else {
        await db.DailyCheckIn.create({
          user_email: user.email,
          check_in_date: today,
          ...checkInData,
          ai_recommendation: recommendation
        });
      }
      
      // Award points for daily check-in
      const pointsData = await db.UserPoints.filter({ user_email: user.email });
      if (pointsData[0]) {
        await db.UserPoints.update(pointsData[0].id, {
          total_points: (pointsData[0].total_points || 0) + 10,
          xp_current: (pointsData[0].xp_current || 0) + 10
        });
      } else {
        await db.UserPoints.create({
          user_email: user.email,
          total_points: 10,
          xp_current: 10
        });
      }
      
      queryClient.invalidateQueries(['checkIn']);
      queryClient.invalidateQueries(['userPoints']);
      
      setTimeout(() => {
        navigate(createPageUrl("Dashboard"));
      }, 2000);
    } catch (err) {
      console.error(err);
    }
    
    setSaving(false);
  };

  if (todayCheckIn && !saving) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="glass-effect border-[#CEF17B]/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">Check-in Completo!</h1>
              <p className="text-[#CEEDB2]">Você já fez seu check-in hoje</p>
            </div>
          </div>

          <Card className="glass-effect p-6 border-[#CEF17B]/20">
            <div className="flex items-center gap-3 mb-4">
              <Check className="w-6 h-6 text-green-400" />
              <h3 className="font-bold text-white">Recomendação da IA FitLens</h3>
            </div>
            <p className="text-[#CEEDB2] leading-relaxed">
              {todayCheckIn.ai_recommendation}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="glass-effect border-[#CEF17B]/20"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Check-in Diário</h1>
            <p className="text-[#CEEDB2] mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <Card className="glass-effect p-6 border-[#CEF17B]/20">
          <div className="space-y-6">
            
            {/* Mood */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-[#CEF17B]" />
                <h3 className="font-bold text-white">Como você está se sentindo?</h3>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {moodOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setCheckInData({...checkInData, mood: option.value})}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-all ${
                        checkInData.mood === option.value
                          ? 'bg-[#CEF17B]/20 border-2 border-[#CEF17B]'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${option.color}`} />
                      <span className="text-xs text-white">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Battery className="w-5 h-5 text-[#CEF17B]" />
                <h3 className="font-bold text-white">Nível de Energia</h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCheckInData({...checkInData, energy_level: level})}
                    className={`flex-1 py-3 rounded-lg transition-all ${
                      checkInData.energy_level === level
                        ? 'bg-[#CEF17B] text-[#084734]'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-[#CEF17B]" />
                <h3 className="font-bold text-white">Qualidade do Sono</h3>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setCheckInData({...checkInData, sleep_quality: level})}
                    className={`flex-1 py-3 rounded-lg transition-all ${
                      checkInData.sleep_quality === level
                        ? 'bg-[#CEF17B] text-[#084734]'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Pain Areas */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[#CEF17B]" />
                <h3 className="font-bold text-white">Alguma dor ou desconforto?</h3>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {painAreas.map((area) => {
                  const isSelected = checkInData.pain_areas.includes(area);
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        if (area === "Nenhuma") {
                          setCheckInData({...checkInData, pain_areas: []});
                        } else {
                          setCheckInData({
                            ...checkInData,
                            pain_areas: isSelected
                              ? checkInData.pain_areas.filter(a => a !== area)
                              : [...checkInData.pain_areas.filter(a => a !== "Nenhuma"), area]
                          });
                        }
                      }}
                      className={`py-2 px-3 rounded-lg text-sm transition-all ${
                        isSelected || (area === "Nenhuma" && checkInData.pain_areas.length === 0)
                          ? 'bg-[#CEF17B]/20 border border-[#CEF17B] text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <h3 className="font-bold text-white mb-3">Observações (opcional)</h3>
              <Textarea
                placeholder="Como está se sentindo? Algo que queira compartilhar..."
                value={checkInData.notes}
                onChange={(e) => setCheckInData({...checkInData, notes: e.target.value})}
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />
            </div>

            {/* AI Recommendation Preview */}
            {aiRecommendation && (
              <Card className="bg-[#CEF17B]/10 border-[#CEF17B]/30 p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-[#CEF17B] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-white mb-1">Recomendação FitLens IA</h4>
                    <p className="text-sm text-[#CEEDB2]">{aiRecommendation}</p>
                  </div>
                </div>
              </Card>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 gradient-button text-[#084734] font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Salvar Check-in (+10 XP)
                </>
              )}
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}