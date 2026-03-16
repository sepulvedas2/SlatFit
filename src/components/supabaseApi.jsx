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

const mapUserProgressFromDb = (item) => {
  if (!item) return null;
  return {
    ...item,
    user_id: item.user_id || item.id,
    total_xp: item.total_points || 0,
    nivel: item.level || 1,
    xp_atual: item.xp_current || 0,
    xp_para_proximo_nivel: item.xp_next_level || 100,
    xp_proximo_nivel: item.xp_next_level || 100,
    streak_dias: item.daily_streak || 0,
    last_activity_date: item.last_workout_date || null,
    updated_at: item.updated_date || null,
  };
};

const mapUserProgressToDb = (item = {}) => {
  const mapped = { ...item };
  if ('total_xp' in mapped) mapped.total_points = mapped.total_xp;
  if ('nivel' in mapped) mapped.level = mapped.nivel;
  if ('xp_atual' in mapped) mapped.xp_current = mapped.xp_atual;
  if ('xp_para_proximo_nivel' in mapped) mapped.xp_next_level = mapped.xp_para_proximo_nivel;
  if ('xp_proximo_nivel' in mapped) mapped.xp_next_level = mapped.xp_proximo_nivel;
  if ('streak_dias' in mapped) mapped.daily_streak = mapped.streak_dias;
  if ('last_activity_date' in mapped) mapped.last_workout_date = mapped.last_activity_date;
  if ('updated_at' in mapped) mapped.updated_date = mapped.updated_at;
  delete mapped.total_xp;
  delete mapped.nivel;
  delete mapped.xp_atual;
  delete mapped.xp_para_proximo_nivel;
  delete mapped.xp_proximo_nivel;
  delete mapped.streak_dias;
  delete mapped.last_activity_date;
  delete mapped.updated_at;
  delete mapped.user_id;
  return mapped;
};

const userProgressApi = {
  async list(sort = '-created_date', limit = 50) {
    const mappedSort = sort
      .replace('total_xp', 'total_points')
      .replace('nivel', 'level')
      .replace('xp_atual', 'xp_current')
      .replace('xp_para_proximo_nivel', 'xp_next_level');
    const col = mappedSort ? mappedSort.replace(/^-/, '') : 'created_date';
    const asc = mappedSort ? !mappedSort.startsWith('-') : false;
    const result = await invoke({
      action: 'select', table: 'user_points',
      query: { limit, order: { column: col, ascending: asc } }
    });
    return (result?.data || []).map(mapUserProgressFromDb);
  },

  async filter(filters = {}, sort, limit = 500) {
    const mappedFilters = mapUserProgressToDb(filters);
    const mappedSort = (sort || '-created_date')
      .replace('total_xp', 'total_points')
      .replace('nivel', 'level')
      .replace('xp_atual', 'xp_current')
      .replace('xp_para_proximo_nivel', 'xp_next_level');
    const col = mappedSort ? mappedSort.replace(/^-/, '') : 'created_date';
    const asc = mappedSort ? !mappedSort.startsWith('-') : false;
    const result = await invoke({
      action: 'select', table: 'user_points',
      query: { filter: mappedFilters, limit, order: { column: col, ascending: asc } }
    });
    return (result?.data || []).map(mapUserProgressFromDb);
  },

  async create(data) {
    const result = await invoke({ action: 'insert', table: 'user_points', data: mapUserProgressToDb(data) });
    return mapUserProgressFromDb(result?.data?.[0] || null);
  },

  async update(id, data) {
    const result = await invoke({
      action: 'update', table: 'user_points', data: mapUserProgressToDb(data),
      query: { filter: { id } }
    });
    return mapUserProgressFromDb(result?.data?.[0] || null);
  },

  async get(id) {
    const result = await invoke({
      action: 'select', table: 'user_points',
      query: { filter: { id }, limit: 1 }
    });
    return mapUserProgressFromDb(result?.data?.[0] || null);
  }
};

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
  UserBodyProgress: createEntityAPI('user_body_progress'),
  UserProgress: userProgressApi,
  Ranking: createEntityAPI('ranking'),
  Mission: createEntityAPI('missions'),
  MissionProgress: createEntityAPI('missions_progress'),
};