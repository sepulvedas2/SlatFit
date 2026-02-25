// All available challenges in the system
// goal: null = any goal, "weight_loss" or "muscle_gain" = specific
export const ALL_CHALLENGES = [
  // ── FÁCIL ──────────────────────────────────────────────────
  {
    id: "easy_water_2",
    title: "Hidratação Básica",
    description: "Bata sua meta de água por 2 dias",
    icon: "💧",
    difficulty: "easy",
    xp: 60,
    target: 2,
    unit: "dias",
    goal: null,
    cooldownDays: 7,
  },
  {
    id: "easy_workout_2",
    title: "Dupla na Semana",
    description: "Complete 2 treinos nesta semana",
    icon: "⚡",
    difficulty: "easy",
    xp: 70,
    target: 2,
    unit: "treinos",
    goal: null,
    cooldownDays: 7,
  },
  {
    id: "easy_food_3",
    title: "Registro Consciente",
    description: "Registre suas refeições por 3 dias seguidos",
    icon: "🥗",
    difficulty: "easy",
    xp: 55,
    target: 3,
    unit: "dias",
    goal: null,
    cooldownDays: 7,
  },

  // ── MÉDIO ──────────────────────────────────────────────────
  {
    id: "medium_streak_5",
    title: "Sequência de Ferro",
    description: "Treine 5 dias seguidos sem falta",
    icon: "🔥",
    difficulty: "medium",
    xp: 200,
    target: 5,
    unit: "dias",
    goal: null,
    cooldownDays: 7,
  },
  {
    id: "medium_protein_5",
    title: "Proteína em Dia",
    description: "Bata sua meta de proteína por 5 dias",
    icon: "💪",
    difficulty: "medium",
    xp: 180,
    target: 5,
    unit: "dias",
    goal: "muscle_gain",
    cooldownDays: 7,
  },
  {
    id: "medium_food_7",
    title: "Semana Completa",
    description: "Registre refeições por 7 dias seguidos",
    icon: "📋",
    difficulty: "medium",
    xp: 220,
    target: 7,
    unit: "dias",
    goal: null,
    cooldownDays: 7,
  },
  {
    id: "medium_calorie_5",
    title: "Deficit Consistente",
    description: "Fique dentro da meta calórica por 5 dias",
    icon: "🎯",
    difficulty: "medium",
    xp: 200,
    target: 5,
    unit: "dias",
    goal: "weight_loss",
    cooldownDays: 7,
  },

  // ── DIFÍCIL (requer Prata+) ────────────────────────────────
  {
    id: "hard_streak_14",
    title: "Duas Semanas Sólidas",
    description: "14 dias seguidos treinando",
    icon: "🦾",
    difficulty: "hard",
    xp: 600,
    target: 14,
    unit: "dias",
    goal: null,
    requiredRank: "silver",
    cooldownDays: 14,
  },
  {
    id: "hard_diet_10",
    title: "Dieta de Aço",
    description: "10 dias seguidos dentro da dieta",
    icon: "🛡️",
    difficulty: "hard",
    xp: 500,
    target: 10,
    unit: "dias",
    goal: "weight_loss",
    requiredRank: "silver",
    cooldownDays: 14,
  },
  {
    id: "hard_water_15",
    title: "Hidratação Total",
    description: "15 dias batendo meta de água",
    icon: "🌊",
    difficulty: "hard",
    xp: 450,
    target: 15,
    unit: "dias",
    goal: null,
    requiredRank: "silver",
    cooldownDays: 14,
  },
  {
    id: "hard_workouts_20",
    title: "20 Treinos Cumpridos",
    description: "Complete 20 treinos registrados",
    icon: "💥",
    difficulty: "hard",
    xp: 700,
    target: 20,
    unit: "treinos",
    goal: null,
    requiredRank: "silver",
    cooldownDays: 14,
  },

  // ── EXTREMO (requer Ouro+, 1x/mês) ───────────────────────
  {
    id: "extreme_30_streak",
    title: "30 Dias Ininterruptos",
    description: "Treine 30 dias seguidos. Sem exceção.",
    icon: "👑",
    difficulty: "extreme",
    xp: 2000,
    target: 30,
    unit: "dias",
    goal: null,
    requiredRank: "gold",
    cooldownDays: 30,
    monthlyLimit: true,
  },
  {
    id: "extreme_30_log",
    title: "30 Dias de Registro Total",
    description: "Registre tudo por 30 dias. Cada refeição conta.",
    icon: "📊",
    difficulty: "extreme",
    xp: 1500,
    target: 30,
    unit: "dias",
    goal: null,
    requiredRank: "gold",
    cooldownDays: 30,
    monthlyLimit: true,
  },
  {
    id: "extreme_21_streak",
    title: "Hábito Inquebrável",
    description: "21 dias seguidos de treino — onde hábitos nascem.",
    icon: "🧠",
    difficulty: "extreme",
    xp: 1200,
    target: 21,
    unit: "dias",
    goal: null,
    requiredRank: "gold",
    cooldownDays: 30,
    monthlyLimit: true,
  },
];

export function getChallengesForUser(userGoal, userRankKey, activeChallengeIds = [], completedRecentIds = []) {
  const rankOrder = ["bronze", "silver", "gold", "platinum", "diamond", "legendary"];
  const userRankIndex = rankOrder.indexOf(userRankKey || "bronze");

  return ALL_CHALLENGES.map(c => {
    const isActive = activeChallengeIds.includes(c.id);
    const isRecentlyCompleted = completedRecentIds.includes(c.id);

    // Check rank requirement
    let locked = false;
    let lockReason = "";

    if (c.requiredRank) {
      const requiredIndex = rankOrder.indexOf(c.requiredRank);
      if (userRankIndex < requiredIndex) {
        locked = true;
        lockReason = `Requer rank ${c.requiredRank === "silver" ? "Prata" : c.requiredRank === "gold" ? "Ouro" : c.requiredRank}`;
      }
    }

    if (isRecentlyCompleted) {
      locked = true;
      lockReason = `Em cooldown`;
    }

    // Filter by goal (null = all)
    const goalMatch = !c.goal || c.goal === userGoal;

    return { ...c, isActive, locked, lockReason, goalMatch };
  }).filter(c => c.goalMatch);
}