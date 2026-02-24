import type { StageSpec } from "./stage-spec";
import stagesV2 from "./stages.v2.json";
import stagesLegacy from "./stages.mvp.json";

export type StageVersion = "v2" | "legacy";

export interface StageResult {
  stage: StageSpec;
  version: StageVersion;
}

const v2 = stagesV2 as StageSpec[];
const legacy = stagesLegacy as StageSpec[];
const allStages: StageSpec[] = [...v2, ...legacy];

/**
 * Lookup a stage by raw ID.
 * Applies decodeURIComponent + trim, then searches v2 first, legacy second.
 */
export function findStageById(rawId: string | undefined): StageResult | null {
  if (!rawId) return null;

  let id: string;
  try {
    id = decodeURIComponent(rawId).trim();
  } catch {
    id = rawId.trim();
  }

  const v2Match = v2.find((s) => s.id === id);
  if (v2Match) return { stage: v2Match, version: "v2" };

  const legacyMatch = legacy.find((s) => s.id === id);
  if (legacyMatch) return { stage: legacyMatch, version: "legacy" };

  return null;
}

/**
 * Get all stage IDs for not-found suggestions.
 */
export function getAllStageIds(): string[] {
  return allStages.map((s) => s.id);
}

/**
 * Simple Levenshtein-based suggestions for a mistyped ID.
 */
export function getSuggestions(rawId: string, maxCount = 3): string[] {
  let id: string;
  try {
    id = decodeURIComponent(rawId).trim().toLowerCase();
  } catch {
    id = rawId.trim().toLowerCase();
  }

  const scored = allStages
    .map((s) => ({ id: s.id, dist: levenshtein(id, s.id.toLowerCase()) }))
    .sort((a, b) => a.dist - b.dist);

  return scored.slice(0, maxCount).map((s) => s.id);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1]![j - 1]!
          : 1 + Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!);
    }
  }
  return dp[m]![n]!;
}
