import type { StageSpec } from '../stages/stage-spec';
import type { ChallengeProgress, ChallengeStep } from '../game-state/types';

// 전체 스테이지 풀 (import from JSON files)
import stagesV3 from '../stages/stages.v3.json';
import stagesV2 from '../stages/stages.v2.json';
import stagesLegacy from '../stages/stages.mvp.json';
import stagesUxhell from '../stages/stages.uxhell.json';

const allStages: StageSpec[] = [...(stagesV3 as StageSpec[]), ...(stagesV2 as StageSpec[]), ...(stagesLegacy as StageSpec[]), ...(stagesUxhell as StageSpec[])];

// 난이도 슬롯: Easy → Very Hard
const DIFFICULTY_SLOTS: number[] = [1, 2, 3, 3, 4, 5];

/** KST(UTC+9) 기준 오늘 날짜 문자열 */
export function getTodayKST(): string {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** mulberry32 PRNG */
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 날짜 문자열을 시드 숫자로 변환 */
function dateToSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = ((hash << 5) - hash + date.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** 일일 챌린지 6스테이지 생성 */
export function generateDailyChallenge(date: string): StageSpec[] {
  const rng = mulberry32(dateToSeed(date));
  const selected: StageSpec[] = [];
  const usedTypes = new Set<string>();

  for (const targetDiff of DIFFICULTY_SLOTS) {
    // 해당 난이도 스테이지 필터 (이미 사용된 type 제외)
    let candidates = allStages.filter(
      (s) => s.difficulty === targetDiff && !usedTypes.has(s.type) && !selected.some((sel) => sel.id === s.id)
    );

    // fallback: 인접 난이도
    if (candidates.length === 0) {
      candidates = allStages.filter(
        (s) =>
          Math.abs(s.difficulty - targetDiff) <= 1 &&
          !usedTypes.has(s.type) &&
          !selected.some((sel) => sel.id === s.id)
      );
    }

    // final fallback: 아무거나
    if (candidates.length === 0) {
      candidates = allStages.filter((s) => !selected.some((sel) => sel.id === s.id));
    }

    if (candidates.length === 0) break;

    const idx = Math.floor(rng() * candidates.length);
    const pick = candidates[idx]!;
    selected.push(pick);
    usedTypes.add(pick.type);
  }

  return selected;
}

/** ChallengeProgress 초기화 */
export function createChallengeProgress(date: string, stages: StageSpec[]): ChallengeProgress {
  const steps: ChallengeStep[] = stages.map((s, i) => ({
    stageId: s.id,
    status: i === 0 ? 'unlocked' : 'locked',
  }));

  return {
    date,
    steps,
    allCleared: false,
    bonusClaimed: false,
  };
}
