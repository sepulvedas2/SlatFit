import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { db } from "@/components/supabaseApi";
import { Input } from "@/components/ui/input";
import { Search, Database, Plus } from "lucide-react";
import FoodSelectionModal from "./FoodSelectionModal";

export default function FoodSearchSection({ onAddFood }) {
  const [mode, setMode] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["foodDatabaseSearch", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const response = await base44.functions.invoke("searchFoodsDatabase", { query: searchTerm });
      return response.data?.foods || [];
    },
    enabled: searchTerm.trim().length >= 2,
    initialData: [],
  });

  const { data: browseFoods = [] } = useQuery({
    queryKey: ["foodDatabaseBrowse"],
    queryFn: () => db.FoodDatabase.list("food_name", 30),
    initialData: [],
  });

  const visibleFoods = useMemo(() => mode === "search" ? searchResults : browseFoods, [mode, searchResults, browseFoods]);

  return (
    <>
      <div className="rounded-3xl p-4 space-y-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(206,241,123,0.12)" }}>
        <div>
          <h3 className="text-white font-bold text-base">Alternativas ao scanner</h3>
          <p className="text-white/45 text-xs mt-1">Busque manualmente ou selecione do banco de alimentos.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("search")}
            className="h-11 rounded-2xl text-sm font-semibold"
            style={{
              background: mode === "search" ? "rgba(206,241,123,0.15)" : "rgba(255,255,255,0.04)",
              color: mode === "search" ? "#CEF17B" : "rgba(255,255,255,0.55)",
              border: mode === "search" ? "1px solid rgba(206,241,123,0.25)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Buscar alimento
          </button>
          <button
            onClick={() => setMode("browse")}
            className="h-11 rounded-2xl text-sm font-semibold"
            style={{
              background: mode === "browse" ? "rgba(206,241,123,0.15)" : "rgba(255,255,255,0.04)",
              color: mode === "browse" ? "#CEF17B" : "rgba(255,255,255,0.55)",
              border: mode === "browse" ? "1px solid rgba(206,241,123,0.25)" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            Banco de alimentos
          </button>
        </div>

        {mode === "search" && (
          <div className="relative">
            <Search className="w-4 h-4 text-white/35 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: Arroz branco 100g"
              className="pl-10 bg-white/5 border-white/10 text-white h-12"
            />
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {visibleFoods.map((food) => (
            <button
              key={food.id}
              onClick={() => setSelectedFood(food)}
              className="w-full rounded-2xl p-4 text-left"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-white font-semibold text-sm">{food.food_name}</p>
                  <p className="text-white/40 text-xs mt-1">{food.portion_size}</p>
                  <p className="text-white/60 text-xs mt-2">
                    {Math.round(food.calories || 0)} kcal • {Math.round(food.protein || 0)}g prot • {Math.round(food.carbohydrates || 0)}g carb • {Math.round(food.fat || 0)}g gord
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.12)" }}>
                  {mode === "search" ? <Search className="w-4 h-4 text-[#CEF17B]" /> : <Database className="w-4 h-4 text-[#CEF17B]" />}
                </div>
              </div>
            </button>
          ))}

          {visibleFoods.length === 0 && (
            <div className="py-8 text-center text-white/35 text-sm">
              {mode === "search" ? "Digite pelo menos 2 caracteres para buscar." : "Nenhum alimento encontrado no banco."}
            </div>
          )}
        </div>
      </div>

      <FoodSelectionModal
        open={!!selectedFood}
        food={selectedFood}
        onClose={() => setSelectedFood(null)}
        onAdd={async (payload) => {
          await onAddFood(payload);
          setSelectedFood(null);
        }}
      />
    </>
  );
}