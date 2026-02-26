export interface GameState {
  userHash: string | null;
  uxp: UXPState;
  attendance: AttendanceState;
  collection: CollectionState;
  challengeProgress: ChallengeProgress | null;
  tossPointHistory: TossPointEntry[];
}

export interface UXPState {
  total: number;
  entries: UXPEntry[];
}

export interface UXPEntry {
  id: string;
  timestamp: string;
  type: 'stage_clear' | 'challenge_step' | 'challenge_bonus' | 'attendance' | 'streak_bonus' | 'rewarded_ad' | 'first_clear';
  amount: number;
  stageId?: string;
}

export interface AttendanceState {
  attendedDates: string[];
  currentStreak: number;
  maxStreak: number;
  lastDate: string | null;
}

export interface CollectionState {
  clearedStageIds: string[];
  viewedCardIds: string[];
}

export interface ChallengeProgress {
  date: string;
  steps: ChallengeStep[];
  allCleared: boolean;
  bonusClaimed: boolean;
}

export interface ChallengeStep {
  stageId: string;
  status: 'locked' | 'unlocked' | 'cleared' | 'failed';
  result?: { elapsedMs: number; missCount: number; uxpEarned: number };
}

export interface TossPointEntry {
  timestamp: string;
  reason: string;
  amount: number;
}

export type GameAction =
  | { type: 'INIT'; state: GameState }
  | { type: 'SET_USER_HASH'; hash: string }
  | { type: 'ADD_UXP'; entry: UXPEntry }
  | { type: 'DOUBLE_REWARD'; stageId: string }
  | { type: 'RECORD_ATTENDANCE'; date: string }
  | { type: 'ADD_CLEARED_STAGE'; stageId: string }
  | { type: 'ADD_VIEWED_CARD'; stageId: string }
  | { type: 'SET_CHALLENGE_PROGRESS'; progress: ChallengeProgress }
  | { type: 'UPDATE_CHALLENGE_STEP'; stepIndex: number; status: ChallengeStep['status']; result?: ChallengeStep['result'] }
  | { type: 'CLAIM_CHALLENGE_BONUS' }
  | { type: 'ADD_TOSS_POINT'; entry: TossPointEntry };
