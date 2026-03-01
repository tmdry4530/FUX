import type { GameState } from '../game-state/types';
import type { StageSpec } from '../stages/stage-spec';
import { grantTossPoint, save, load } from '../toss-adapter/TossAdapter';
import stagesV3 from '../stages/stages.v3.json';
import stagesV2 from '../stages/stages.v2.json';
import stagesLegacy from '../stages/stages.mvp.json';
import stagesUxhell from '../stages/stages.uxhell.json';

const TOTAL_STAGES = (stagesV3 as StageSpec[]).length + (stagesV2 as StageSpec[]).length + (stagesLegacy as StageSpec[]).length + (stagesUxhell as StageSpec[]).length;

interface Milestone {
  code: string;
  reason: string;
  amount: number;
  check: (state: GameState) => boolean;
  /** 반복 가능한 마일스톤인지 (예: 일일 챌린지 클리어는 매일 가능) */
  repeatable?: boolean;
  /** repeatable일 때 사용할 고유 키 생성 함수 */
  getKey?: (state: GameState) => string;
}

const MILESTONES: Milestone[] = [
  {
    code: 'ILB_CHALLENGE_CLEAR',
    reason: '일일 챌린지 전체 클리어',
    amount: 10,
    check: (s) => s.challengeProgress?.allCleared === true && !s.challengeProgress?.bonusClaimed,
    repeatable: true,
    getKey: (s) => `challenge_${s.challengeProgress?.date}`,
  },
  {
    code: 'ILB_STREAK_7',
    reason: '7일 연속 출석',
    amount: 30,
    check: (s) => s.attendance.currentStreak >= 7,
  },
  {
    code: 'ILB_STREAK_14',
    reason: '14일 연속 출석',
    amount: 50,
    check: (s) => s.attendance.currentStreak >= 14,
  },
  {
    code: 'ILB_STREAK_30',
    reason: '30일 연속 출석',
    amount: 100,
    check: (s) => s.attendance.currentStreak >= 30,
  },
  {
    code: 'ILB_FULL_COLLECTION',
    reason: '교육 카드 전체 수집',
    amount: 200,
    check: (s) => s.collection.clearedStageIds.length >= TOTAL_STAGES,
  },
];

/** 지급 가능한 마일스톤 체크 + 지급 */
export async function checkAndGrantMilestones(
  state: GameState,
  onGrant: (code: string, reason: string, amount: number) => void
): Promise<void> {
  for (const m of MILESTONES) {
    if (!m.check(state)) continue;

    const grantKey = m.repeatable && m.getKey
      ? `toss_point_granted:${m.code}:${m.getKey(state)}`
      : `toss_point_granted:${m.code}`;

    const alreadyGranted = await load(grantKey);
    if (alreadyGranted) continue;

    const result = await grantTossPoint(m.code, m.amount);
    if (result.success) {
      await save(grantKey, result.key ?? 'granted');
      onGrant(m.code, m.reason, m.amount);
    }
  }
}
