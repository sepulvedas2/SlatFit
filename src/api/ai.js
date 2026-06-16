import { request, uploadFile as transportUploadFile } from './transport';

// Single source of truth for AI access. Prompts live on SlatFit BE; the client
// only sends validated structured inputs to named operations (POST /ai/<op>).
async function runOperation(operation, input) {
  const data = await request(`/ai/${operation}`, { method: 'POST', body: input ?? {} });
  if (data?.error) throw new Error(data.error);
  return data?.result;
}

// Vision: analyze a food photo (by URL) -> { food_name, portion_size, calories, protein, carbs, fats }.
export function analyzeFoodImage(image_url) {
  return runOperation('analyzeFoodImage', { image_url });
}

// -> { suggestion }
export function mealSuggestion({ food_name, calories, protein, carbs, fats, goal }) {
  return runOperation('mealSuggestion', { food_name, calories, protein, carbs, fats, goal });
}

// -> { suggestions: [{ original, substitute, savings, reason }] }
export function mealSubstitutions({ food_items, calories, goal }) {
  return runOperation('mealSubstitutions', { food_items, calories, goal });
}

// -> formatted plain-text meal plan
export function mealPlan({ goal, weight, gender, level, mode, ingredients }) {
  return runOperation('mealPlan', { goal, weight, gender, level, mode, ingredients });
}

// -> structured workout plan JSON
export function workoutPlan({ objective, frequency, level, place, time, injuries }) {
  return runOperation('workoutPlan', { objective, frequency, level, place, time, injuries });
}

// -> plain-text coach message
export function coachMessage({ mode, userName, profile, state }) {
  return runOperation('coachMessage', { mode, userName, profile, state });
}

// Persona-driven assistant chat -> plain-text reply.
// persona: 'nutrition' | 'personal' | 'iago' | 'assistant'
export function chat({ persona, message, history, context }) {
  return runOperation('chat', { persona, message, history, context });
}

// File upload -> { file_url }
export function uploadFile(file) {
  return transportUploadFile(file);
}
