import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function LearningCards() {
  const { data: content = [] } = useQuery({
    queryKey: ['learningContent'],
    queryFn: () => base44.entities.LearningContent.list('-created_date', 5),
    initialData: [],
    staleTime: 10 * 60 * 1000,
  });

  return (
    <Card className="glass-effect p-6 border-[#CEF17B]/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#CEF17B]" />
          <h3 className="font-bold text-white">Aprenda com Seu Assistente Personal</h3>
        </div>
        <Link to={createPageUrl("LearningLibrary")}>
          <Button size="sm" variant="ghost" className="text-[#CEF17B] hover:text-[#CEF17B] hover:bg-[#CEF17B]/10">
            Ver tudo
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {content.slice(0, 4).map((item) => (
          <Link key={item.id} to={createPageUrl("LearningLibrary")}>
            <Card className="bg-white/5 border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1 leading-tight">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#CEEDB2] line-clamp-2">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-white/60">{item.duration_minutes} min</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#CEF17B] flex-shrink-0 ml-2" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-4 p-3 bg-[#CEF17B]/10 rounded-lg border border-[#CEF17B]/20">
        <p className="text-xs text-[#CEEDB2] text-center">
          💡 "Entender o que você come é mais importante do que contar calorias." - Seu Assistente Personal
        </p>
      </div>
    </Card>
  );
}