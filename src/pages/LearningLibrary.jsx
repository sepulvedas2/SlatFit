import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  ChevronRight,
  Flame,
  Brain,
  Users,
  Utensils,
  Dumbbell
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function LearningLibrary() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedContent, setExpandedContent] = useState(null);

  const { data: allContent = [] } = useQuery({
    queryKey: ['learningContent'],
    queryFn: () => base44.entities.LearningContent.list(),
    initialData: [],
    staleTime: 10 * 60 * 1000,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['learningCategories'],
    queryFn: () => base44.entities.LearningCategory.list(),
    initialData: [],
    staleTime: 10 * 60 * 1000,
  });

  const categoryIcons = {
    alimentacao_pratica: Utensils,
    mitos_verdades: Brain,
    comportamento_alimentar: Users,
    treino_nutricao: Dumbbell,
    dia_a_dia: Flame
  };

  const categoryColors = {
    alimentacao_pratica: "from-blue-500/20 to-cyan-500/20",
    mitos_verdades: "from-purple-500/20 to-pink-500/20",
    comportamento_alimentar: "from-orange-500/20 to-yellow-500/20",
    treino_nutricao: "from-red-500/20 to-orange-500/20",
    dia_a_dia: "from-green-500/20 to-emerald-500/20"
  };

  const categoryLabels = {
    alimentacao_pratica: "Alimentação Prática",
    mitos_verdades: "Mitos & Verdades",
    comportamento_alimentar: "Comportamento Alimentar",
    treino_nutricao: "Treino & Nutrição",
    dia_a_dia: "Dia a Dia"
  };

  // Dica do Dia - random ou primeira featured
  const featuredTip = allContent.find(c => c.is_featured) || allContent[0];

  // Filtrar conteúdo por categoria
  const filteredContent = selectedCategory 
    ? allContent.filter(c => c.category === selectedCategory && c.id !== featuredTip?.id)
    : allContent.filter(c => c.id !== featuredTip?.id);

  const categoryCount = (catId) => {
    return allContent.filter(c => c.category === catId).length;
  };

  return (
    <div className="min-h-screen p-4 md:p-6 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#CEF17B]" />
              Aprenda com seu Assistente
            </h1>
            <p className="text-[#CEEDB2] text-sm">Dicas rápidas para o seu dia a dia</p>
          </div>
        </div>

        {/* Dica do Dia */}
        {featuredTip && (
          <Card className="glass-effect border-[#CEF17B]/30 bg-gradient-to-br from-[#CEF17B]/10 to-[#CEEDB2]/5 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4 text-[#CEF17B]" />
                    <span className="text-[#CEF17B] text-xs font-bold uppercase">Dica do Dia</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">{featuredTip.title}</h2>
                  <p className="text-[#CEEDB2] text-sm mb-3">{featuredTip.subtitle}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-white/70 text-xs">
                      <Clock className="w-3 h-3" />
                      {featuredTip.duration_minutes} min
                    </div>
                    <button
                      onClick={() => setExpandedContent(featuredTip.id)}
                      className="text-[#CEF17B] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Ler completo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categorias */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">Categorias</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const Icon = categoryIcons[key];
              const count = categoryCount(key);
              const isActive = selectedCategory === key;

              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(isActive ? null : key)}
                  className={`p-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-[#CEF17B]/20 border border-[#CEF17B]/40"
                      : "glass-effect border border-white/10 hover:border-[#CEF17B]/30"
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isActive ? "text-[#CEF17B]" : "text-white/70"}`} />
                  <p className={`text-xs font-semibold ${isActive ? "text-[#CEF17B]" : "text-white"}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-white/50 mt-1">{count} dicas</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Biblioteca de Conteúdos */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3 uppercase tracking-wide">
            {selectedCategory ? categoryLabels[selectedCategory] : "Todas as Dicas"}
          </h3>
          <div className="space-y-3">
            {filteredContent.length === 0 ? (
              <Card className="glass-effect border-[#CEF17B]/20 p-6 text-center">
                <p className="text-white/70">Nenhuma dica encontrada nesta categoria.</p>
              </Card>
            ) : (
              filteredContent.map((content) => {
                const Icon = categoryIcons[content.category];
                const isExpanded = expandedContent === content.id;

                return (
                  <Card
                    key={content.id}
                    className={`glass-effect border-[#CEF17B]/20 cursor-pointer transition-all overflow-hidden ${
                      isExpanded ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                  >
                    <CardContent className="p-4">
                      <div
                        onClick={() => setExpandedContent(isExpanded ? null : content.id)}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1">
                          <Icon className="w-5 h-5 text-[#CEF17B]" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm leading-tight">
                            {content.title}
                          </h4>
                          <p className="text-[#CEEDB2] text-xs mt-1">{content.subtitle}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-white/50" />
                            <span className="text-[10px] text-white/60">{content.duration_minutes} min</span>
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-[#CEF17B] transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </div>

                      {/* Conteúdo Expandido */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <div className="prose prose-invert prose-sm max-w-none text-white/90">
                            {content.content.split('\n').map((paragraph, idx) => (
                              <p key={idx} className="text-sm leading-relaxed mb-3 text-white/80">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}