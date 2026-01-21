import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Check, ChevronRight, Filter } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LearningCards() {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: allTips = [] } = useQuery({
    queryKey: ['learningTips'],
    queryFn: () => base44.entities.LearningTip.list(),
    initialData: [],
  });

  const categories = [
    { id: "all", name: "Todas", count: allTips.length },
    { id: "Alimentação Prática", name: "Alimentação Prática", count: allTips.filter(t => t.category === "Alimentação Prática").length },
    { id: "Mitos & Verdades", name: "Mitos & Verdades", count: allTips.filter(t => t.category === "Mitos & Verdades").length },
    { id: "Comportamento Alimentar", name: "Comportamento", count: allTips.filter(t => t.category === "Comportamento Alimentar").length },
    { id: "Treino & Nutrição", name: "Treino & Nutrição", count: allTips.filter(t => t.category === "Treino & Nutrição").length },
    { id: "Dia a Dia", name: "Dia a Dia", count: allTips.filter(t => t.category === "Dia a Dia").length },
  ];

  const filteredTips = selectedCategory === "all" 
    ? allTips 
    : allTips.filter(tip => tip.category === selectedCategory);

  const dailyTip = allTips[0]; // Primeira dica como "dica do dia"

  return (
    <>
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-white text-xl">Aprenda com Seu Assistente Personal</h3>
            <p className="text-sm text-[#CEEDB2] mt-1">Dicas rápidas para o seu dia a dia</p>
          </div>
          <BookOpen className="w-6 h-6 text-[#CEF17B]" />
        </div>

        {/* Dica do Dia */}
        {dailyTip && (
          <Card className="gradient-card p-5 mb-6 cursor-pointer hover:scale-[1.02] transition-all border-0"
            onClick={() => setSelectedLesson(dailyTip)}>
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-[#084734] text-[#CEF17B] border-0">✨ Dica do Dia</Badge>
              <Badge variant="outline" className="text-xs border-[#084734]/20">
                {dailyTip.reading_time}
              </Badge>
            </div>
            <h4 className="font-bold text-[#084734] text-lg mb-2">{dailyTip.title}</h4>
            <div className="flex items-center gap-2 text-[#084734]/80">
              <span className="text-sm">Ler agora</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        )}

        {/* Categorias */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#CEF17B]" />
            <span className="text-sm text-white font-semibold">Categorias</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={selectedCategory === cat.id 
                  ? "bg-[#CEF17B] text-[#084734] hover:bg-[#CEF17B]/90 border-0" 
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} <span className="ml-1.5 opacity-70">({cat.count})</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Lista de Dicas */}
        <div className="space-y-3">
          <h4 className="text-sm text-white font-semibold mb-3">
            {selectedCategory === "all" ? "Todas as Dicas" : categories.find(c => c.id === selectedCategory)?.name}
          </h4>
          
          {filteredTips.length === 0 ? (
            <p className="text-center text-white/50 py-8">Nenhuma dica encontrada</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filteredTips.map((tip) => (
                <Card
                  key={tip.id}
                  className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all"
                  onClick={() => setSelectedLesson(tip)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {tip.title}
                      </h4>
                      <Badge variant="outline" className="bg-white/5 border-white/10 text-xs mt-2">
                        {tip.category}
                      </Badge>
                    </div>
                    <Play className="w-5 h-5 text-[#CEF17B] flex-shrink-0 ml-2" />
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-[#CEEDB2]">
                    <span>{tip.reading_time}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
          <p className="text-xs text-[#CEEDB2] text-center">
            💡 "Entender o que você come é mais importante do que contar calorias." - Seu Assistente Personal
          </p>
        </div>
      </Card>

      {/* Lesson Modal */}
      {selectedLesson && (
        <Dialog open={!!selectedLesson} onOpenChange={() => setSelectedLesson(null)}>
          <DialogContent className="max-w-2xl bg-[#084734] border-[#CEF17B]/30">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">
                {selectedLesson.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Badge className="bg-[#CEF17B]/20 text-[#CEF17B] border-0">
                {selectedLesson.duration} de leitura
              </Badge>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#CEEDB2] whitespace-pre-line leading-relaxed">
                  {selectedLesson.content}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 gradient-button text-[#084734]"
                  onClick={() => setSelectedLesson(null)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Marcar como Lido
                </Button>
                <Button
                  variant="outline"
                  className="border-[#CEF17B]/20 hover:bg-[#CEF17B]/10"
                >
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}