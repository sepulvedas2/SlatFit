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
  const actualTableName = (tableName === 'user_progress' || tableName === 'user_streak') ? 'user_points' : tableName;
  const defaultSortColumn = actualTableName === 'user_profiles' ? 'created_at' : 'created_date';
  const isUserProgress = tableName === 'user_progress';
  const isUserStreak = tableName === 'user_streak';

  const mapUserPointsToProgress = (row) => row ? ({
    ...row,
    total_xp: row.total_xp ?? row.total_points ?? 0,
    nivel: row.nivel ?? row.level ?? 1,
    xp_atual: row.xp_atual ?? row.xp_current ?? 0,
    xp_proximo_nivel: row.xp_proximo_nivel ?? row.xp_next_level ?? 100,
    streak_dias: row.streak_dias ?? row.daily_streak ?? 0,
    longest_streak: row.longest_streak ?? 0,
    weekly_goal: row.weekly_goal ?? 4,
    weekly_completed: row.weekly_completed ?? 0,
  }) : row;

  const mapUserPointsToStreak = (row) => row ? ({
    ...row,
    user_id: row.user_id ?? row.user_email,
    current_streak: row.current_streak ?? row.daily_streak ?? 0,
    longest_streak: row.longest_streak ?? 0,
    last_checkin_date: row.last_checkin_date ?? row.last_workout_date ?? null,
  }) : row;

  const mapOutgoingData = (data) => {
    if (isUserProgress) {
      return {
        ...data,
        total_points: data.total_points ?? data.total_xp,
        level: data.level ?? data.nivel,
        xp_current: data.xp_current ?? data.xp_atual,
        xp_next_level: data.xp_next_level ?? data.xp_proximo_nivel,
        daily_streak: data.daily_streak ?? data.streak_dias,
      };
    }

    if (isUserStreak) {
      return {
        ...data,
        daily_streak: data.daily_streak ?? data.current_streak,
        longest_streak: data.longest_streak,
        last_workout_date: data.last_workout_date ?? data.last_checkin_date,
      };
    }

    return data;
  };

  const mapIncomingRows = (rows) => {
    if (isUserProgress) return (rows || []).map(mapUserPointsToProgress);
    if (isUserStreak) return (rows || []).map(mapUserPointsToStreak);
    return rows || [];
  };

  return {
    async list(sort = `-${defaultSortColumn}`, limit = 50) {
      const col = sort ? sort.replace(/^-/, '') : defaultSortColumn;
      const asc = sort ? !sort.startsWith('-') : false;
      try {
        const result = await invoke({
          action: 'select', table: actualTableName,
          query: { limit, order: { column: col, ascending: asc } }
        });
        return mapIncomingRows(result?.data);
      } catch (error) {
        if (!isUserProgress && !isUserStreak) throw error;
        const fallback = await invoke({
          action: 'select', table: 'user_points',
          query: { limit, order: { column: 'created_date', ascending: asc } }
        });
        return mapIncomingRows(fallback?.data);
      }
    },

    async filter(filters = {}, sort, limit = 500) {
      const col = sort ? sort.replace(/^-/, '') : defaultSortColumn;
      const asc = sort ? !sort.startsWith('-') : false;
      try {
        const result = await invoke({
          action: 'select', table: actualTableName,
          query: { filter: filters, limit, order: { column: col, ascending: asc } }
        });
        return mapIncomingRows(result?.data);
      } catch (error) {
        if (!isUserProgress && !isUserStreak) throw error;
        const fallback = await invoke({
          action: 'select', table: 'user_points',
          query: { filter: filters, limit, order: { column: 'created_date', ascending: asc } }
        });
        return mapIncomingRows(fallback?.data);
      }
    },

    async create(data) {
      const result = await invoke({ action: 'insert', table: actualTableName, data: mapOutgoingData(data) });
      return mapIncomingRows(result?.data)?.[0] || null;
    },

    async bulkCreate(items) {
      const result = await invoke({ action: 'insert', table: actualTableName, data: items.map(mapOutgoingData) });
      return mapIncomingRows(result?.data);
    },

    async update(id, data) {
      const result = await invoke({
        action: 'update', table: actualTableName, data: mapOutgoingData(data),
        query: { filter: { id } }
      });
      return mapIncomingRows(result?.data)?.[0] || null;
    },

    async delete(id) {
      await invoke({ action: 'delete', table: actualTableName, query: { filter: { id } } });
      return true;
    },

    async get(id) {
      const result = await invoke({
        action: 'select', table: actualTableName,
        query: { filter: { id }, limit: 1 }
      });
      return mapIncomingRows(result?.data)?.[0] || null;
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
  UserXpLog: createEntityAPI('user_xp_log'),
  UserStreak: createEntityAPI('user_streak'),
  Ranking: createEntityAPI('ranking'),
  Mission: createEntityAPI('missions'),
  MissionProgress: createEntityAPI('missions_progress'),
};