import { invokeFunction } from './transport';

async function invoke(payload) {
  const resp = await invokeFunction('supabase', payload);
  if (resp.data?.error) {
    throw new Error(resp.data.error);
  }
  return resp.data;
}

function mapUserPointsToProgress(row) {
  if (!row) return row;
  return {
    ...row,
    total_xp: row.total_points ?? 0,
    nivel: row.level ?? 1,
    xp_atual: row.xp_current ?? 0,
    xp_proximo_nivel: row.xp_next_level ?? 100,
    streak_dias: row.daily_streak ?? 0,
    longest_streak: row.longest_streak ?? 0,
    weekly_goal: row.weekly_goal ?? 4,
    weekly_completed: row.weekly_completed ?? 0,
  };
}

function mapProgressWriteToPoints(data = {}) {
  const mapped = {};
  if (data.user_id != null) mapped.user_id = data.user_id;
  if (data.weekly_goal != null) mapped.weekly_goal = data.weekly_goal;
  if (data.weekly_completed != null) mapped.weekly_completed = data.weekly_completed;
  if (data.longest_streak != null) mapped.longest_streak = data.longest_streak;
  if (data.daily_streak != null) mapped.daily_streak = data.daily_streak;
  if (data.streak_dias != null) mapped.daily_streak = data.streak_dias;
  if (data.total_points != null) mapped.total_points = data.total_points;
  if (data.total_xp != null) mapped.total_points = data.total_xp;
  if (data.level != null) mapped.level = data.level;
  if (data.nivel != null) mapped.level = data.nivel;
  if (data.xp_current != null) mapped.xp_current = data.xp_current;
  if (data.xp_atual != null) mapped.xp_current = data.xp_atual;
  if (data.xp_next_level != null) mapped.xp_next_level = data.xp_next_level;
  if (data.xp_proximo_nivel != null) mapped.xp_next_level = data.xp_proximo_nivel;
  return mapped;
}

export function createEntityAPI(tableName) {
  const defaultSortColumn = tableName === 'user_profiles' ? 'created_at' : 'created_date';
  const isUserProgress = tableName === 'user_progress';
  const readTable = isUserProgress ? 'user_points' : tableName;
  const readSortColumn = isUserProgress
    ? (col) => (col === 'created_date' ? 'updated_date' : col)
    : (col) => col;

  return {
    async list(sort = `-${defaultSortColumn}`, limit = 50) {
      const col = readSortColumn(sort ? sort.replace(/^-/, '') : defaultSortColumn);
      const asc = sort ? !sort.startsWith('-') : false;
      const result = await invoke({
        action: 'select', table: readTable,
        query: { limit, order: { column: col, ascending: asc } }
      });
      const rows = result?.data || [];
      return isUserProgress ? rows.map(mapUserPointsToProgress) : rows;
    },

    async filter(filters = {}, sort, limit = 500) {
      const col = readSortColumn(sort ? sort.replace(/^-/, '') : defaultSortColumn);
      const asc = sort ? !sort.startsWith('-') : false;
      const result = await invoke({
        action: 'select', table: readTable,
        query: { filter: filters, limit, order: { column: col, ascending: asc } }
      });
      const rows = result?.data || [];
      return isUserProgress ? rows.map(mapUserPointsToProgress) : rows;
    },

    async create(data) {
      if (isUserProgress) {
        const mapped = {
          total_points: 0,
          level: 1,
          xp_current: 0,
          xp_next_level: 100,
          rank: 'bronze',
          daily_streak: 0,
          longest_streak: 0,
          weekly_goal: 4,
          weekly_completed: 0,
          ...mapProgressWriteToPoints(data),
        };
        const result = await invoke({ action: 'insert', table: 'user_points', data: mapped });
        return mapUserPointsToProgress(result?.data?.[0] || null);
      }
      const result = await invoke({ action: 'insert', table: tableName, data });
      return result?.data?.[0] || null;
    },

    async bulkCreate(items) {
      if (isUserProgress) {
        const mapped = items.map((item) => ({
          total_points: 0,
          level: 1,
          xp_current: 0,
          xp_next_level: 100,
          rank: 'bronze',
          daily_streak: 0,
          longest_streak: 0,
          weekly_goal: 4,
          weekly_completed: 0,
          ...mapProgressWriteToPoints(item),
        }));
        const result = await invoke({ action: 'insert', table: 'user_points', data: mapped });
        return (result?.data || []).map(mapUserPointsToProgress);
      }
      const result = await invoke({ action: 'insert', table: tableName, data: items });
      return result?.data || [];
    },

    async update(id, data) {
      if (isUserProgress) {
        const mapped = mapProgressWriteToPoints(data);
        const result = await invoke({
          action: 'update', table: 'user_points', data: mapped,
          query: { filter: { id } }
        });
        return mapUserPointsToProgress(result?.data?.[0] || null);
      }
      const result = await invoke({
        action: 'update', table: tableName, data,
        query: { filter: { id } }
      });
      return result?.data?.[0] || null;
    },

    async upsert(data, onConflict = 'id') {
      if (isUserProgress) {
        const mapped = {
          total_points: 0,
          level: 1,
          xp_current: 0,
          xp_next_level: 100,
          rank: 'bronze',
          daily_streak: 0,
          longest_streak: 0,
          weekly_goal: 4,
          weekly_completed: 0,
          ...mapProgressWriteToPoints(data),
          ...(data.id != null ? { id: data.id } : {}),
        };
        const result = await invoke({
          action: 'upsert', table: 'user_points', data: mapped,
          query: { onConflict: onConflict === 'id' ? 'user_id' : onConflict }
        });
        return mapUserPointsToProgress(result?.data?.[0] || null);
      }
      const result = await invoke({
        action: 'upsert', table: tableName, data,
        query: { onConflict }
      });
      return result?.data?.[0] || null;
    },

    async delete(id) {
      await invoke({
        action: 'delete',
        table: readTable,
        query: { filter: { id } },
      });
      return true;
    },

    async get(id) {
      const result = await invoke({
        action: 'select', table: readTable,
        query: { filter: { id }, limit: 1 }
      });
      const row = result?.data?.[0] || null;
      return isUserProgress ? mapUserPointsToProgress(row) : row;
    }
  };
}

export const entities = {
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
  Exercise: createEntityAPI('exercises'),
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
