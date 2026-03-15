import { base44 } from "@/api/base44Client";

async function invoke(payload) {
  try {
    console.log('[Supabase API] Chamando:', payload.action, 'na tabela:', payload.table);
    const resp = await base44.functions.invoke('supabase', payload);
    if (resp.data?.error) {
      console.error('[Supabase API] Erro retornado:', resp.data.error);
      throw new Error(resp.data.error);
    }
    console.log('[Supabase API] Sucesso:', payload.action, 'na tabela:', payload.table);
    return resp.data;
  } catch (error) {
    console.error('[Supabase API] Erro na requisição:', error);
    throw error;
  }
}

function createEntityAPI(tableName) {
  return {
    async list(sort = '-created_date', limit = 50) {
      const col = sort ? sort.replace(/^-/, '') : 'created_date';
      const asc = sort ? !sort.startsWith('-') : false;
      const result = await invoke({
        action: 'select', table: tableName,
        query: { limit, order: { column: col, ascending: asc } }
      });
      return result?.data || [];
    },

    async filter(filters = {}, sort, limit = 500) {
      const col = sort ? sort.replace(/^-/, '') : 'created_date';
      const asc = sort ? !sort.startsWith('-') : false;
      const result = await invoke({
        action: 'select', table: tableName,
        query: { filter: filters, limit, order: { column: col, ascending: asc } }
      });
      return result?.data || [];
    },

    async create(data) {
      const result = await invoke({ action: 'insert', table: tableName, data });
      return result?.data?.[0] || null;
    },

    async bulkCreate(items) {
      const result = await invoke({ action: 'insert', table: tableName, data: items });
      return result?.data || [];
    },

    async update(id, data) {
      const result = await invoke({
        action: 'update', table: tableName, data,
        query: { filter: { id } }
      });
      return result?.data?.[0] || null;
    },

    async delete(id) {
      await invoke({ action: 'delete', table: tableName, query: { filter: { id } } });
      return true;
    },

    async get(id) {
      const result = await invoke({
        action: 'select', table: tableName,
        query: { filter: { id }, limit: 1 }
      });
      return result?.data?.[0] || null;
    }
  };
}

// Tabelas ATIVAS no app — apenas o que é realmente usado
export const db = {
  // Core
  UserProfile: createEntityAPI('user_profiles'),
  UserPoints: createEntityAPI('user_points'),      // Sistema unificado de XP/progresso
  Achievement: createEntityAPI('achievements'),

  // Nutrição
  FoodLog: createEntityAPI('food_logs'),
  NutritionData: createEntityAPI('nutrition_data'),
  MealPlan: createEntityAPI('meal_plans'),

  // Treinos
  Workout: createEntityAPI('workouts'),
  WorkoutLog: createEntityAPI('workout_logs'),
  DailyWorkout: createEntityAPI('daily_workouts'),
  Exercise: createEntityAPI('exercises', false),   // global, sem filtro de email
  PRRecord: createEntityAPI('pr_records'),
  CustomWorkout: createEntityAPI('custom_workouts'),
  CustomWorkoutExercise: createEntityAPI('custom_workout_exercises'),

  // Hábitos
  Habit: createEntityAPI('habits'),
  HabitLog: createEntityAPI('habit_logs'),

  // Desafios
  Challenge: createEntityAPI('challenges'),
  UserChallenge: createEntityAPI('user_challenges'),

  // Outros
  DailyCheckIn: createEntityAPI('daily_check_ins'),
  ProgressPhoto: createEntityAPI('progress_photos'),
  MotivationalJournal: createEntityAPI('motivational_journals'),
  WeeklyProgress: createEntityAPI('weekly_progress'),
};