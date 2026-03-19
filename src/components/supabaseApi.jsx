import { base44 } from "@/api/base44Client";

async function invoke(payload, attempts = 3) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
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
      lastError = error;
      const status = error?.response?.status;
      const shouldRetry = status === 502 || status === 503 || status === 504;
      console.error('[Supabase API] Erro na requisição:', error);
      if (!shouldRetry || i === attempts - 1) break;
    }
  }

  throw lastError;
}

function createEntityAPI(tableName) {
  const defaultSortColumn = tableName === 'user_profiles' ? 'created_at' : 'created_date';
  const isUserProgress = tableName === 'user_progress';
  const mapUserPointsToProgress = (row) => row ? ({
    ...row,
    total_xp: row.total_xp ?? row.total_points ?? 0,
    nivel: row.nivel ?? row.level ?? 1,
    xp_atual: row.xp_atual ?? row.xp_current ?? 0,
    xp_proximo_nivel: row.xp_proximo_nivel ?? row.xp_next_level ?? 100,
    streak_dias: row.streak_dias ?? row.daily_streak ?? 0,
    longest_streak: row.longest_streak ?? 0,
  }) : row;

  return {
    async list(sort = `-${defaultSortColumn}`, limit = 50) {
      const col = sort ? sort.replace(/^-/, '') : defaultSortColumn;
      const asc = sort ? !sort.startsWith('-') : false;
      try {
        const result = await invoke({
          action: 'select', table: tableName,
          query: { limit, order: { column: col, ascending: asc } }
        });
        return isUserProgress ? (result?.data || []).map(mapUserPointsToProgress) : (result?.data || []);
      } catch (error) {
        if (!isUserProgress) throw error;
        const fallback = await invoke({
          action: 'select', table: 'user_points',
          query: { limit, order: { column: 'created_date', ascending: asc } }
        });
        return (fallback?.data || []).map(mapUserPointsToProgress);
      }
    },

    async filter(filters = {}, sort, limit = 500) {
      const col = sort ? sort.replace(/^-/, '') : defaultSortColumn;
      const asc = sort ? !sort.startsWith('-') : false;
      try {
        const result = await invoke({
          action: 'select', table: tableName,
          query: { filter: filters, limit, order: { column: col, ascending: asc } }
        });
        return isUserProgress ? (result?.data || []).map(mapUserPointsToProgress) : (result?.data || []);
      } catch (error) {
        if (!isUserProgress) throw error;
        const fallback = await invoke({
          action: 'select', table: 'user_points',
          query: { filter: filters, limit, order: { column: 'created_date', ascending: asc } }
        });
        return (fallback?.data || []).map(mapUserPointsToProgress);
      }
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

export const db = {
  UserProfile: createEntityAPI('user_profiles'),
  FoodLog: createEntityAPI('food_logs'),
  Workout: createEntityAPI('workouts'),
  WorkoutLog: createEntityAPI('workout_logs'),
  MealPlan: createEntityAPI('meal_plans'),
  Subscription: createEntityAPI('subscriptions'),
  Achievement: createEntityAPI('achievements'),
  DailyCheckIn: createEntityAPI('daily_check_ins'),
  Challenge: createEntityAPI('challenges'),
  UserChallenge: createEntityAPI('user_challenges'),
  UserPoints: createEntityAPI('user_points'),
  ProgressPhoto: createEntityAPI('progress_photos'),
  MotivationalJournal: createEntityAPI('motivational_journals'),
  IAGOConversation: createEntityAPI('iago_conversations'),
  NutritionData: createEntityAPI('nutrition_data'),
  AgendaTask: createEntityAPI('agenda_tasks'),
  Exercise: createEntityAPI('exercises', false),
  WeeklyProgress: createEntityAPI('weekly_progress'),
  DailyWorkout: createEntityAPI('daily_workouts'),
  CustomWorkout: createEntityAPI('custom_workouts'),
  CustomWorkoutExercise: createEntityAPI('custom_workout_exercises'),
  PRRecord: createEntityAPI('pr_records'),
  TrainingProfile: createEntityAPI('training_profiles'),
  AIFeedback: createEntityAPI('ai_feedback'),
  LearningTip: createEntityAPI('learning_tips'),
  RunningActivity: createEntityAPI('running_activities'),
  RunningChallenge: createEntityAPI('running_challenges'),
  CityLeaderboard: createEntityAPI('city_leaderboards'),
  CityChallenge: createEntityAPI('city_challenges'),
  SavedRoute: createEntityAPI('saved_routes'),
  Habit: createEntityAPI('habits'),
  HabitLog: createEntityAPI('habit_logs'),
  DailyMetric: createEntityAPI('daily_metrics'),
  UserProgress: createEntityAPI('user_progress'),
  Ranking: createEntityAPI('ranking'),
  Mission: createEntityAPI('missions'),
  MissionProgress: createEntityAPI('missions_progress'),
};