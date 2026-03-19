import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExplorarDesafiosCard({ categories, activeIds, onActivate, isSaving }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/35">Explorar Desafios</p>
      <div className="mt-4 space-y-5">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-3 text-sm font-bold text-white">{category}</h3>
            <div className="space-y-3">
              {items.slice(0, 4).map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-1 text-xs text-white/50">{item.durationDays} dias • {item.xpReward} XP • {item.difficulty}</p>
                    </div>
                    <Button onClick={() => onActivate(item)} disabled={isSaving || activeIds.has(item.id)} className="h-10 rounded-2xl bg-white/10 px-4 text-xs font-bold text-white hover:bg-white/15">
                      {activeIds.has(item.id) ? 'Ativo' : 'Ativar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}