import type { StageSpec } from "./stage-spec";
import stagesV3 from "./stages.v3.json";
import stagesV2 from "./stages.v2.json";
import stagesLegacy from "./stages.mvp.json";
import stagesUxhell from "./stages.uxhell.json";

export type StageVersion = "v3" | "v2" | "legacy" | "uxhell";

export interface StageResult {
  stage: StageSpec;
  version: StageVersion;
}

const v3 = stagesV3 as StageSpec[];
const v2 = stagesV2 as StageSpec[];
const legacy = stagesLegacy as StageSpec[];
const uxhell = stagesUxhell as StageSpec[];
const allStages: StageSpec[] = [...v3, ...v2, ...legacy, ...uxhell];

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

  const v3Match = v3.find((s) => s.id === id);
  if (v3Match) return { stage: v3Match, version: "v3" };

  const v2Match = v2.find((s) => s.id === id);
  if (v2Match) return { stage: v2Match, version: "v2" };

  const legacyMatch = legacy.find((s) => s.id === id);
  if (legacyMatch) return { stage: legacyMatch, version: "legacy" };

  const uxhellMatch = uxhell.find((s) => s.id === id);
  if (uxhellMatch) return { stage: uxhellMatch, version: "uxhell" };

  return null;
}

/**
 * Get all stage IDs for not-found suggestions.
 */
export function getAllStageIds(): string[] {
  return allStages.map((s) => s.id);
}

/**
 * Get the next stage ID after the given one (across all versions).
 */
export function getNextStageId(currentId: string): string | null {
  const idx = allStages.findIndex((s) => s.id === currentId);
  if (idx === -1 || idx >= allStages.length - 1) return null;
  return allStages[idx + 1]?.id ?? null;
}

/**
 * Simple Levenshtein-based suggestions for a mistyped ID.
 */
export function getSuggestions(rawId: string, maxCount = 3): { id: string; title: string }[] {
  let id: string;
  try {
    id = decodeURIComponent(rawId).trim().toLowerCase();
  } catch {
    id = rawId.trim().toLowerCase();
  }

  const scored = allStages
    .map((s) => ({ id: s.id, title: s.title, dist: levenshtein(id, s.id.toLowerCase()) }))
    .sort((a, b) => a.dist - b.dist);

  return scored.slice(0, maxCount).map((s) => ({ id: s.id, title: s.title }));
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
