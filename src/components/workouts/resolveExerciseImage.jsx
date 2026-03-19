export function normalizeExerciseName(name = "") {
  return name.replace(/\s*\((?:fem(?:\s*[a-z])?)\)\s*$/i, "").trim();
}

export function getPersistentExerciseRecord(exercises = [], exerciseName = "") {
  if (!exerciseName) return null;

  const exact = exercises.find((exercise) => exercise.name === exerciseName && exercise.image_url);
  if (exact) return exact;

  const normalizedName = normalizeExerciseName(exerciseName);
  return exercises.find(
    (exercise) => exercise.image_url && normalizeExerciseName(exercise.name) === normalizedName,
  ) || null;
}

export function getPersistentExerciseImage(exercises = [], exerciseName = "") {
  return getPersistentExerciseRecord(exercises, exerciseName)?.image_url || "";
}