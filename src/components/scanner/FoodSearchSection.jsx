import React, { useMemo, useState } from "react";

const FALLBACK_FOODS = [
  { id: "fallback-1", food_name: "Arroz branco", portion_size: "100g", calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3 },
  { id: "fallback-2", food_name: "Arroz integral", portion_size: "100g", calories: 124, protein: 2.6, carbohydrates: 25.8, fat: 1 },
  { id: "fallback-3", food_name: "Frango grelhado", portion_size: "100g", calories: 165, protein: 31, carbohydrates: 0, fat: 3.6 },
  { id: "fallback-4", food_name: "Ovo cozido", portion_size: "1 unidade", calories: 78, protein: 6.3, carbohydrates: 0.6, fat: 5.3 },
  { id: "fallback-5", food_name: "Banana", portion_size: "1 unidade média", calories: 89, protein: 1.1, carbohydrates: 22.8, fat: 0.3 },
  { id: "fallback-6", food_name: "Maçã", portion_size: "1 unidade média", calories: 95, protein: 0.5, carbohydrates: 25.1, fat: 0.3 },
  { id: "fallback-7", food_name: "Batata doce", portion_size: "100g", calories: 86, protein: 1.6, carbohydrates: 20.1, fat: 0.1 },
  { id: "fallback-8", food_name: "Carne bovina", portion_size: "100g", calories: 250, protein: 26, carbohydrates: 0, fat: 15 },
  { id: "fallback-9", food_name: "Aveia", portion_size: "100g", calories: 389, protein: 16.9, carbohydrates: 66.3, fat: 6.9 },
  { id: "fallback-10", food_name: "Leite", portion_size: "200ml", calories: 122, protein: 6.4, carbohydrates: 9.6, fat: 6.6 },
  { id: "fallback-11", food_name: "Pão integral", portion_size: "2 fatias", calories: 138, protein: 6, carbohydrates: 24, fat: 2 },
];
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
import { Search, Database } from "lucide-react";
import FoodSelectionModal from "./FoodSelectionModal";

export default function FoodSearchSection({ onAddFood }) {
  const [mode, setMode] = useState("search");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);

  const { data: searchResults = [] } = useQuery({
    queryKey: ["foodDatabaseSearch", searchTerm],
    queryFn: async () => {
      try {
        const response = await api.functions.invoke("searchFoodsDatabase", { query: searchTerm });
        const foods = response.data?.foods;
        if (Array.isArray(foods) && foods.length > 0) return foods;
      } catch (error) {
        console.error('[FoodSearchSection] Busca no Supabase indisponível, usando fallback local.', error);
      }
      return FALLBACK_FOODS.filter((food) => food.food_name.toLowerCase().includes(searchTerm.toLowerCase()));
    },
    enabled: searchTerm.trim().length >= 2,
    initialData: [],
  });

  const { data: browseFoods = [] } = useQuery({
    queryKey: ["foodDatabaseBrowse"],
    queryFn: async () => {
      try {
        const response = await api.functions.invoke("searchFoodsDatabase", { query: "" });
        const foods = response.data?.foods;
        if (Array.isArray(foods) && foods.length > 0) return foods;
      } catch (error) {
        console.error('[FoodSearchSection] Banco no Supabase indisponível, usando fallback local.', error);
      }
      return FALLBACK_FOODS;
    },
    enabled: mode === "browse",
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