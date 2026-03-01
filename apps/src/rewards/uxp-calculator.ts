import type { StageSpec } from '../stages/stage-spec';
import type { StageResult } from '../engine/types';

const BASE_UXP: Record<number, number> = {
  1: 10,   // Very Easy
  2: 10,   // Easy
  3: 10,   // Normal
  4: 10,   // Hard
  5: 10,   // Very Hard
};

const TIME_BONUS_THRESHOLD = 0.5; // 50% 이내 클리어
const TIME_BONUS_RATE = 0.2;      // +20%
const NO_MISS_BONUS_RATE = 0.1;   // +10%
const FIRST_CLEAR_BONUS = 10;

export interface UXPBreakdown {
  base: number;
  timeBonus: number;
  noMissBonus: number;
  firstClearBonus: number;
  total: number;
}

export function calculateUXP(
  spec: StageSpec,
  result: StageResult,
  isFirstClear: boolean
): UXPBreakdown {
  if (!result.cleared) {
    return { base: 0, timeBonus: 0, noMissBonus: 0, firstClearBonus: 0, total: 0 };
  }

  const base = BASE_UXP[spec.difficulty] ?? 50;

  // 시간 보너스: 제한 시간의 50% 이내에 클리어
  const timeRatio = result.elapsedMs / result.timeLimitMs;
  const timeBonus = timeRatio <= TIME_BONUS_THRESHOLD
    ? Math.round(base * TIME_BONUS_RATE)
    : 0;

  // 노미스 보너스
  const noMissBonus = result.missCount === 0
    ? Math.round(base * NO_MISS_BONUS_RATE)
    : 0;

  // 최초 클리어 보너스
  const firstClearBonus = isFirstClear ? FIRST_CLEAR_BONUS : 0;

  const total = base + timeBonus + noMissBonus + firstClearBonus;

  return { base, timeBonus, noMissBonus, firstClearBonus, total };
}
