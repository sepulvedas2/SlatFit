import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Flame, ChefHat, Leaf } from "lucide-react";
import MealFilters from "../components/meals/MealFilters";
import MealDetailModal from "../components/meals/MealDetailModal";

export default function MealPlans() {
  const [user, setUser] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState("all");
  const [selectedMeal, setSelectedMeal] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: profile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
  });

  const { data: meals, isLoading } = useQuery({
    queryKey: ['mealPlans'],
    queryFn: () => base44.entities.MealPlan.list(),
    initialData: [],
  });

  const filteredMeals = meals.filter(meal => {
    const matchesMealType = selectedMealType === "all" || meal.meal_type === selectedMealType;
    const matchesGoal = !profile?.goal || meal.goal_type === profile.goal;
    return matchesMealType && matchesGoal;
  });

  const mealTypeLabels = {
    breakfast: "Café da Manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche"
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
            Planos Alimentares
          </h1>
          <p className="text-gray-400 mt-2">
            Refeições balanceadas para {profile?.goal === 'weight_loss' ? 'emagrecimento' : 
              profile?.goal === 'muscle_gain' ? 'ganho de massa' : 'manutenção'}
          </p>
        </div>

        {/* Filters */}
        <MealFilters
          selected={selectedMealType}
          onChange={setSelectedMealType}
        />

        {/* Meals Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-slate-900/50 rounded-xl animate-pulse" />
            ))
          ) : filteredMeals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">Nenhuma refeição encontrada</p>
            </div>
          ) : (
            filteredMeals.map((meal) => (
              <Card 
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className="bg-slate-900/50 backdrop-blur-xl border-white/10 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                {meal.image_url && (
                  <div 
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${meal.image_url})` }}
                  />
                )}
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-lg">{meal.name}</h3>
                    <p className="text-sm text-gray-400">{mealTypeLabels[meal.meal_type]}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {meal.dietary_tags?.map((tag, i) => (
                      <Badge 
                        key={i}
                        variant="outline" 
                        className="bg-green-500/20 text-green-400 border-green-500/30 text-xs"
                      >
                        <Leaf className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{meal.calories} kcal</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{meal.prep_time_minutes} min</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between text-xs text-gray-400">
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carbs}g</span>
                    <span>G: {meal.fats}g</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <MealDetailModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </div>
  );
}