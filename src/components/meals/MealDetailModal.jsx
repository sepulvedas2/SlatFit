import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Flame, Leaf, CheckCircle } from "lucide-react";

export default function MealDetailModal({ meal, onClose }) {
  const mealTypeLabels = {
    breakfast: "Café da Manhã",
    lunch: "Almoço",
    dinner: "Jantar",
    snack: "Lanche"
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            {meal.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {meal.image_url && (
            <img
              src={meal.image_url}
              alt={meal.name}
              className="w-full h-64 object-cover rounded-xl"
            />
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 flex-wrap">
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
              {mealTypeLabels[meal.meal_type]}
            </Badge>
            <div className="flex items-center gap-1 text-gray-300">
              <Flame className="w-4 h-4" />
              <span>{meal.calories} kcal</span>
            </div>
            <div className="flex items-center gap-1 text-gray-300">
              <Clock className="w-4 h-4" />
              <span>{meal.prep_time_minutes} min</span>
            </div>
          </div>

          {/* Macros */}
          <Card className="bg-slate-800/50 border-white/10 p-4">
            <h3 className="font-semibold text-white mb-3">Informação Nutricional</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-400">{meal.protein}g</p>
                <p className="text-xs text-gray-400">Proteína</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">{meal.carbs}g</p>
                <p className="text-xs text-gray-400">Carboidratos</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{meal.fats}g</p>
                <p className="text-xs text-gray-400">Gorduras</p>
              </div>
            </div>
          </Card>

          {/* Dietary Tags */}
          {meal.dietary_tags?.length > 0 && (
            <div>
              <h3 className="font-semibold text-white mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {meal.dietary_tags.map((tag, i) => (
                  <Badge 
                    key={i}
                    variant="outline" 
                    className="bg-green-500/20 text-green-400 border-green-500/30"
                  >
                    <Leaf className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          <div>
            <h3 className="font-semibold text-white mb-3">Ingredientes:</h3>
            <ul className="space-y-2">
              {meal.ingredients?.map((ingredient, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="font-semibold text-white mb-3">Modo de Preparo:</h3>
            <ol className="space-y-3">
              {meal.instructions?.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-gray-300">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}