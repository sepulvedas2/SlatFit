import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Check, Bookmark } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function LearningCards() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  const lessons = [
    {
      id: 1,
      title: "O que é saciedade e por que ela importa",
      summary: "Entenda a diferença entre fome física e emocional",
      content: `A saciedade é o sinal que seu corpo dá quando está satisfeito. Não é apenas "estar cheio" - é quando você percebe que pode parar de comer sem sentir privação.

Muitas vezes comemos por:
• Tédio ou ansiedade
• Horário do relógio
• Hábito social

A verdadeira fome física vem gradualmente e pode esperar. Já a fome emocional é urgente e específica.

💬 Seu Assistente Personal diz: "Antes de comer, pergunte: estou com fome ou estou sentindo outra coisa?"`,
      duration: "3 min"
    },
    {
      id: 2,
      title: "Carboidratos: vilões ou aliados?",
      summary: "A verdade sobre a fonte de energia do seu corpo",
      content: `Carboidratos não são vilões - são combustível!

O problema nunca foi o carboidrato, mas sim:
• A qualidade (refinado vs integral)
• A quantidade inadequada
• O timing errado

Carboidratos complexos (arroz integral, batata-doce, aveia) liberam energia gradualmente. Os simples (açúcar, pão branco) causam picos rápidos.

💬 Seu Assistente Personal diz: "Seu corpo precisa de energia. A questão é: você está dando o combustível certo?"`,
      duration: "4 min"
    },
    {
      id: 3,
      title: "O papel da proteína na recuperação",
      summary: "Por que atletas precisam pensar em proteína",
      content: `Proteína não é só para "ficar grande". Ela:

✓ Repara músculos após treino
✓ Mantém você saciado por mais tempo
✓ Ajuda na recuperação
✓ Fortalece sistema imunológico

Você precisa de ~1.6-2.2g por kg de peso corporal se treina regularmente.

Fontes: Frango, peixe, ovos, feijão, tofu, iogurte grego.

💬 Seu Assistente Personal diz: "Proteína é construção. Sem ela, seu treino não vira resultado."`,
      duration: "5 min"
    },
    {
      id: 4,
      title: "Como o estresse muda sua fome",
      summary: "A conexão entre cortisol e apetite",
      content: `Quando você está estressado, seu corpo libera cortisol - o "hormônio do estresse".

Cortisol alto causa:
• Aumento de apetite (especialmente por doces)
• Acúmulo de gordura abdominal
• Desejo por comfort food
• Fadiga e baixa energia

O que fazer:
✓ Respire fundo antes de comer
✓ Durma bem (essencial!)
✓ Pratique mindfulness
✓ Exercite-se regularmente

💬 Seu Assistente Personal diz: "Estresse crônico sabota seus objetivos. Cuide da mente para cuidar do corpo."`,
      duration: "4 min"
    },
    {
      id: 5,
      title: "Sono e alimentação: o elo invisível",
      summary: "Por que dormir mal te faz comer mais",
      content: `Dormir menos de 7h por noite:

• Aumenta grelina (hormônio da fome)
• Diminui leptina (hormônio da saciedade)
• Reduz autocontrole alimentar
• Aumenta desejo por junk food

Uma noite mal dormida pode aumentar sua ingestão calórica em até 300 kcal no dia seguinte.

💬 Seu Assistente Personal diz: "Sono não é luxo, é estratégia. Dormir bem é treino de recuperação."`,
      duration: "3 min"
    },
  ];

  return (
    <>
      <Card className="glass-effect p-6 border-[#CEF17B]/20">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Aprenda com Seu Assistente</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all"
              onClick={() => setSelectedLesson(lesson)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {lesson.title}
                  </h4>
                  <p className="text-xs text-[#CEEDB2]">{lesson.summary}</p>
                </div>
                <Play className="w-5 h-5 text-[#CEF17B] flex-shrink-0 ml-2" />
              </div>
              <Badge variant="outline" className="bg-white/5 border-white/10 text-xs">
                {lesson.duration}
              </Badge>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
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