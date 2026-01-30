import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, ChevronRight, Sparkles, Brain } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Learning() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const { data: allTips = [] } = useQuery({
    queryKey: ['learningTips'],
    queryFn: () => base44.entities.LearningTip.list(),
    initialData: [],
  });

  const categories = [
    { id: "all", name: "Todas", emoji: "📚" },
    { id: "Alimentação Prática", name: "Alimentação", emoji: "🍽️" },
    { id: "Mitos & Verdades", name: "Mitos", emoji: "🔍" },
    { id: "Comportamento Alimentar", name: "Comportamento", emoji: "🧠" },
    { id: "Treino & Nutrição", name: "Treino", emoji: "💪" },
    { id: "Dia a Dia", name: "Dia a Dia", emoji: "📅" },
  ];

  const filteredTips = selectedCategory === "all" 
    ? allTips 
    : allTips.filter(tip => tip.category === selectedCategory);

  const dailyTip = allTips[0];

  return (
    <div className="min-h-screen p-4 md:p-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-5">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-[#CEF17B]/30 mb-3">
            <Brain className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-xs font-bold text-white">BIBLIOTECA DE CONHECIMENTO</span>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Aprenda e Evolua
          </h1>
          
          <p className="text-sm text-[#CEEDB2]">
            Conteúdos educativos do seu assistente personal
          </p>
        </div>

        {/* Dica do Dia (Destaque) */}
        {dailyTip && (
          <Card 
            className="gradient-card p-6 cursor-pointer hover:scale-[1.02] transition-all border-0"
            onClick={() => setSelectedLesson(dailyTip)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#084734]/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#084734]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#084734] text-[#CEF17B] border-0">
                    ✨ Dica do Dia
                  </Badge>
                  <span className="text-xs text-[#084734]/60">
                    {dailyTip.reading_time}
                  </span>
                </div>
                <h3 className="font-bold text-[#084734] text-lg mb-1">
                  {dailyTip.title}
                </h3>
                <div className="flex items-center gap-2 text-[#084734]/70 mt-3">
                  <span className="text-sm font-semibold">Ler agora</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Categorias */}
        <div>
          <h3 className="font-bold text-white text-sm mb-3">Categorias</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => {
              const count = cat.id === "all" 
                ? allTips.length 
                : allTips.filter(t => t.category === cat.id).length;

              return (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  className={selectedCategory === cat.id 
                    ? "bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 border-0 font-semibold" 
                    : "glass-effect border-[#CEF17B]/20 text-white hover:bg-white/10"}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  {cat.name}
                  <span className="ml-1.5 opacity-70">({count})</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Lista de Conteúdos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white text-sm">
              {selectedCategory === "all" ? "Todos os Conteúdos" : categories.find(c => c.id === selectedCategory)?.name}
            </h3>
            <span className="text-xs text-white/60">
              {filteredTips.length} {filteredTips.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {filteredTips.length === 0 ? (
            <Card className="glass-effect border-[#CEF17B]/20 p-12 text-center">
              <p className="text-white/50">Nenhum conteúdo encontrado</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTips.map((tip) => (
                <Card
                  key={tip.id}
                  className="glass-effect border-[#CEF17B]/20 p-4 cursor-pointer hover:scale-[1.01] hover:bg-white/5 transition-all"
                  onClick={() => setSelectedLesson(tip)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-2">
                        {tip.title}
                      </h4>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-white/10 text-white/70 border-0 text-xs">
                          {tip.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-white/60">
                          <Clock className="w-3 h-3" />
                          {tip.reading_time}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#CEF17B] flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Lesson Modal */}
      {selectedLesson && (
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="max-w-2xl bg-[#084734] border-[#CEF17B]/30 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-xl pr-8">
                {selectedLesson.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                  {selectedLesson.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" />
                  {selectedLesson.reading_time}
                </div>
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#CEEDB2] whitespace-pre-line leading-relaxed">
                  {selectedLesson.content}
                </p>
              </div>
              <div className="pt-4">
                <Button
                  className="w-full bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 font-semibold"
                  onClick={() => setSelectedLesson(null)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Continuar Aprendendo
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}