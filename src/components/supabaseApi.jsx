import { base44 } from "@/api/base44Client";

async function invoke(payload) {
  const resp = await base44.functions.invoke('supabase', payload);
  if (resp.data?.error) throw new Error(resp.data.error);
  return resp.data;
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
  Exercise: createEntityAPI('exercises', false), // false = não filtrar por user_email (global)
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
};