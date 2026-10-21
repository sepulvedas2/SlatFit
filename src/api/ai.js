import { toast } from 'sonner';
import { request, uploadFile as transportUploadFile } from './transport';

const RETRYABLE_STATUSES = new Set([429, 502, 503]);
const MAX_ATTEMPTS = 3;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err) {
  if (err?.status) return false;
  const message = String(err?.message || '').toLowerCase();
  return (
    err instanceof TypeError ||
    message.includes('load failed') ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('aborted') ||
    message.includes('timeout')
  );
}

function isRetryable(err) {
  if (err?.retryable === false) return false;
  return RETRYABLE_STATUSES.has(err?.status) || isNetworkError(err);
}

function retryMessage(attempt) {
  if (attempt >= MAX_ATTEMPTS - 1) {
    return 'Ainda sem resposta. Última tentativa...';
  }
  return 'A IA não respondeu. Tentando novamente...';
}

function friendlyAiError(err) {
  if (!isNetworkError(err)) return err;
  const error = new Error('A conexão caiu antes da IA responder. Toque em tentar novamente.');
  error.status = err?.status;
  return error;
}

function sanitizeContext(context) {
  if (!context || typeof context !== 'object') return context;
  const cleaned = {};
  for (const [key, value] of Object.entries(context)) {
    if (value === null || value === undefined) continue;
    cleaned[key] = value;
  }
  return cleaned;
}

// Single source of truth for AI access. Prompts live on SlatFit BE; the client
// only sends validated structured inputs to named operations (POST /ai/<op>).
// Retries once on busy free-model / provider errors, then surfaces the failure.
async function runOperation(operation, input, { onRetry } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const data = await request(`/ai/${operation}`, { method: 'POST', body: input ?? {} });
      if (data?.error) {
        const error = new Error(data.error);
        error.status = 502;
        error.retryable = false;
        error.data = data;
        throw error;
      }
      return data?.result;
    } catch (err) {
      lastError = err;
      if (attempt < MAX_ATTEMPTS && isRetryable(err)) {
        const message = retryMessage(attempt);
        if (onRetry) onRetry(message);
        else toast.message(message);
        await sleep(800 * attempt);
        continue;
      }
      throw friendlyAiError(err);
    }
  }
  throw friendlyAiError(lastError);
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
export function workoutPlan({ objective, frequency, level, place, time, injuries }, options) {
  return runOperation('workoutPlan', { objective, frequency, level, place, time, injuries }, options);
}

// -> plain-text coach message
export function coachMessage({ mode, userName, profile, state }) {
  return runOperation('coachMessage', { mode, userName, profile, state });
}

// Persona-driven assistant chat -> plain-text reply.
// persona: 'nutrition' | 'personal' | 'iago' | 'assistant'
export function chat({ persona, message, history, context }) {
  return runOperation('chat', {
    persona,
    message,
    history,
    context: sanitizeContext(context),
  });
}

// File upload -> { file_url }
export function uploadFile(file) {
  return transportUploadFile(file);
}
