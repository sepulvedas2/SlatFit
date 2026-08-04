import fs from "node:fs";
import path from "node:path";

const API_BASE = "https://api.workoutxapp.com/v1";
const key = process.env.WORKOUTX_API_KEY;

if (!key) {
  throw new Error("WORKOUTX_API_KEY is required");
}

const projectRoot = process.cwd();
const weeklyPlanPath = path.join(projectRoot, "src/components/workouts/WeeklyPlan.jsx");
const outputDir = path.join(projectRoot, "public/exercises/gifs/workoutx");
const resolverPath = path.join(projectRoot, "src/components/workouts/exerciseGifs.jsx");

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toWorkoutXQuery(exerciseName) {
  const normalized = normalize(exerciseName);

  if (normalized.includes("supino") && normalized.includes("inclinado")) return "incline bench press";
  if (normalized.includes("supino") && normalized.includes("halteres")) return "dumbbell bench press";
  if (normalized.includes("supino") && normalized.includes("declinado")) return "decline bench press";
  if (normalized.includes("supino")) return "barbell bench press";
  if (normalized.includes("crucifixo")) return "dumbbell fly";
  if (normalized.includes("triceps") && normalized.includes("corda")) return "rope triceps pushdown";
  if (normalized.includes("triceps") && normalized.includes("mergulho")) return "bench dip";
  if (normalized.includes("mergulho")) return "bench dip";
  if (normalized.includes("triceps") && normalized.includes("coice")) return "dumbbell kickback";
  if (normalized.includes("triceps")) return "triceps pushdown";
  if (normalized.includes("remada") && normalized.includes("curvada")) return "barbell bent over row";
  if (normalized.includes("remada") && normalized.includes("banco")) return "one arm dumbbell row";
  if (normalized.includes("remada")) return "seated cable row";
  if (normalized.includes("puxada") && normalized.includes("fechada")) return "close grip lat pulldown";
  if (normalized.includes("puxada")) return "lat pulldown";
  if (normalized.includes("biceps") && normalized.includes("martelo")) return "hammer curl";
  if (normalized.includes("biceps") || normalized.includes("rosca")) return "biceps curl";
  if (normalized.includes("leg press")) return "leg press";
  if (normalized.includes("agach") && normalized.includes("salto")) return "jump squat";
  if (normalized.includes("agach") && normalized.includes("sumo")) return "sumo squat";
  if (normalized.includes("agach")) return "squat";
  if (normalized.includes("avanco")) return "lunge";
  if (normalized.includes("subida")) return "step up";
  if (normalized.includes("extensora")) return "leg extension";
  if (normalized.includes("flexora")) return "leg curl";
  if (normalized.includes("stiff")) return "romanian deadlift";
  if (normalized.includes("panturrilha")) return "calf raise";
  if (normalized.includes("abdutora") || normalized.includes("adutor")) return "hip abduction";
  if (normalized.includes("elevacao pelvica") || normalized.includes("quadril")) return "hip thrust";
  if (normalized.includes("elevacao lateral")) return "lateral raise";
  if (normalized.includes("elevacao frontal")) return "front raise";
  if (normalized.includes("desenvolvimento") && normalized.includes("rotacao")) return "arnold press";
  if (normalized.includes("desenvolvimento")) return "shoulder press";
  if (normalized.includes("flexao")) return "push up";
  if (normalized.includes("prancha")) return "front plank";
  if (normalized.includes("abdominal") && normalized.includes("infra")) return "lying leg raise";
  if (normalized.includes("abdominal")) return "crunch";

  return normalized;
}

function scoreMatch(exerciseName, query, candidate) {
  const source = normalize(exerciseName);
  const target = normalize(candidate.name);
  const normalizedQuery = normalize(query);
  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const isFemaleVariant = source.includes("fem");

  let score = 0;
  if (target === normalizedQuery) score += 100;
  if (target.includes(normalizedQuery)) score += 70;
  for (const token of queryTokens) {
    if (target.includes(token)) score += 8;
  }
  if (isFemaleVariant && target.includes("female")) score += 25;
  if (!isFemaleVariant && target.includes("female")) score -= 6;
  if (target.includes("weighted")) score -= 4;
  if (target.includes("assisted")) score -= 3;
  if (target.includes("one leg") || target.includes("single")) score -= source.includes("unilateral") ? 0 : 2;

  return score;
}

async function requestJson(url) {
  const response = await fetchWithRetry(url);

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }

  return response.json();
}

async function downloadGif(id) {
  const target = path.join(outputDir, `${id}.gif`);
  if (fs.existsSync(target)) return target;

  const response = await fetchWithRetry(`${API_BASE}/gifs/${id}.gif`);

  if (!response?.ok) {
    throw new Error(`GIF ${id} failed with ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.subarray(0, 6).toString("ascii") !== "GIF89a") {
    throw new Error(`GIF ${id} did not return GIF89a data`);
  }

  fs.writeFileSync(target, bytes);
  return target;
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url) {
  let response;
  for (let attempt = 1; attempt <= 8; attempt += 1) {
    response = await fetch(url, {
      headers: {
        "X-WorkoutX-Key": key,
      },
    });

    if (response.ok || ![429, 503].includes(response.status)) {
      return response;
    }

    const retryAfter = Number(response.headers.get("retry-after"));
    const waitMs = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.min(20_000, 2_000 * attempt);

    await sleep(waitMs);
  }

  return response;
}

function buildResolverFile(mappingEntries, aliases) {
  const lines = [
    'const GIF_BASE = "/exercises/gifs/workoutx";',
    "",
    'export const DEFAULT_EXERCISE_GIF = "/exercises/placeholder.svg";',
    'export const DEFAULT_FEMALE_EXERCISE_GIF = "/exercises/placeholder.svg";',
    'export const EXERCISE_GIF_PLACEHOLDER = "/exercises/placeholder.svg";',
    "",
    "export const EXERCISE_GIFS = {",
    ...mappingEntries.map(
      ([name, id]) => `  ${JSON.stringify(name)}: \`${"${GIF_BASE}"}/${id}.gif\`,`,
    ),
    "};",
    "",
    "export const EXERCISE_GIF_ALIASES = {",
    ...aliases.map(([keyName, targetName]) => `  ${JSON.stringify(keyName)}: ${JSON.stringify(targetName)},`),
    "};",
    "",
    "function normalizeExerciseName(exerciseName) {",
    "  return exerciseName",
    "    .toLowerCase()",
    '    .normalize("NFD")',
    '    .replace(/[\\u0300-\\u036f]/g, "")',
    '    .replace(/[()]/g, " ")',
    '    .replace(/\\s+/g, " ")',
    "    .trim();",
    "}",
    "",
    "function stripFemaleVariant(exerciseName) {",
    "  return exerciseName",
    '    .replace(/\\s*\\(fem(?:\\s+c)?\\)\\s*/gi, " ")',
    '    .replace(/\\s+/g, " ")',
    "    .trim();",
    "}",
    "",
    "export function getExerciseGif(exerciseName) {",
    "  if (!exerciseName) return DEFAULT_EXERCISE_GIF;",
    "",
    "  if (EXERCISE_GIFS[exerciseName]) {",
    "    return EXERCISE_GIFS[exerciseName];",
    "  }",
    "",
    "  const normalizedName = normalizeExerciseName(exerciseName);",
    "  const alias = EXERCISE_GIF_ALIASES[normalizedName];",
    "  if (alias && EXERCISE_GIFS[alias]) {",
    "    return EXERCISE_GIFS[alias];",
    "  }",
    "",
    "  const isFemaleVariant = normalizedName.includes(\"fem\");",
    "  const baseName = stripFemaleVariant(exerciseName);",
    "  if (baseName !== exerciseName && EXERCISE_GIFS[baseName]) {",
    "    return EXERCISE_GIFS[baseName];",
    "  }",
    "",
    "  return isFemaleVariant ? DEFAULT_FEMALE_EXERCISE_GIF : DEFAULT_EXERCISE_GIF;",
    "}",
    "",
  ];

  return lines.join("\n");
}

const weeklyPlanSource = fs.readFileSync(weeklyPlanPath, "utf8");
const exerciseNames = [
  ...new Set(
    [...weeklyPlanSource.matchAll(/name:\s*"([^"]+)"/g)]
      .map((match) => match[1])
      .filter(Boolean),
  ),
];

fs.mkdirSync(outputDir, { recursive: true });

const mappings = [];
const report = [];

for (const exerciseName of exerciseNames) {
  const query = toWorkoutXQuery(exerciseName);
  await sleep(1250);
  const json = await requestJson(`${API_BASE}/exercises/name/${encodeURIComponent(query)}`);
  const data = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
  const match =
    data
      .filter((candidate) => candidate?.id && candidate?.gifUrl)
      .sort((a, b) => scoreMatch(exerciseName, query, b) - scoreMatch(exerciseName, query, a))[0] ?? null;

  if (!match) {
    report.push({ exerciseName, query, status: "missing" });
    continue;
  }

  try {
    await sleep(1250);
    await downloadGif(match.id);
  } catch (error) {
    report.push({
      exerciseName,
      query,
      status: "gif_failed",
      workoutXId: match.id,
      workoutXName: match.name,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    continue;
  }
  mappings.push([exerciseName, match.id]);
  report.push({
    exerciseName,
    query,
    status: "downloaded",
    workoutXId: match.id,
    workoutXName: match.name,
  });
}

const aliasTargets = new Map();
for (const [name] of mappings) {
  const normalizedName = normalize(name);
  const existing = aliasTargets.get(normalizedName);
  if (!existing || existing.includes("(fem)")) {
    aliasTargets.set(normalizedName, name);
  }
}

const aliases = [...aliasTargets.entries()]
  .filter(([normalized, name]) => normalized !== name)
  .sort(([a], [b]) => a.localeCompare(b));

fs.writeFileSync(resolverPath, buildResolverFile(mappings, aliases));
fs.writeFileSync(
  path.join(projectRoot, "scripts/download-workoutx-gifs-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), total: exerciseNames.length, report }, null, 2),
);

const downloaded = new Set(mappings.map(([, id]) => id)).size;
const missing = report.filter((item) => item.status !== "downloaded").length;
console.log(JSON.stringify({ exercises: exerciseNames.length, uniqueGifs: downloaded, missing }, null, 2));
