import type { GameState, GameAction, UXPEntry } from './types';

export const initialGameState: GameState = {
  userHash: null,
  uxp: { total: 0, entries: [] },
  attendance: { attendedDates: [], currentStreak: 0, maxStreak: 0, lastDate: null },
  collection: { clearedStageIds: [], viewedCardIds: [] },
  challengeProgress: null,
  tossPointHistory: [],
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
      return action.state;

    case 'SET_USER_HASH':
      return { ...state, userHash: action.hash };

    case 'ADD_UXP': {
      return {
        ...state,
        uxp: {
          total: state.uxp.total + action.entry.amount,
          entries: [action.entry, ...state.uxp.entries].slice(0, 200),
        },
      };
    }

    case 'DOUBLE_REWARD': {
      // Find the most recent entry for this stageId and double it
      const lastEntry = state.uxp.entries.find(
        (e) => e.stageId === action.stageId && e.type === 'stage_clear'
      );
      if (!lastEntry) return state;
      const bonusEntry: UXPEntry = {
        id: `ad-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'rewarded_ad',
        amount: lastEntry.amount,
        stageId: action.stageId,
      };
      return {
        ...state,
        uxp: {
          total: state.uxp.total + bonusEntry.amount,
          entries: [bonusEntry, ...state.uxp.entries].slice(0, 200),
        },
      };
    }

    case 'RECORD_ATTENDANCE': {
      const { date } = action;
      const att = state.attendance;
      if (att.attendedDates.includes(date)) return state;

      const newDates = [...att.attendedDates, date].sort();
      // Calculate streak
      const isConsecutive = att.lastDate
        ? dayDiff(att.lastDate, date) === 1
        : true;
      const newStreak = isConsecutive ? att.currentStreak + 1 : 1;

      return {
        ...state,
        attendance: {
          attendedDates: newDates,
          currentStreak: newStreak,
          maxStreak: Math.max(att.maxStreak, newStreak),
          lastDate: date,
        },
      };
    }

    case 'ADD_CLEARED_STAGE': {
      if (state.collection.clearedStageIds.includes(action.stageId)) return state;
      return {
        ...state,
        collection: {
          ...state.collection,
          clearedStageIds: [...state.collection.clearedStageIds, action.stageId],
        },
      };
    }

    case 'ADD_VIEWED_CARD': {
      if (state.collection.viewedCardIds.includes(action.stageId)) return state;
      return {
        ...state,
        collection: {
          ...state.collection,
          viewedCardIds: [...state.collection.viewedCardIds, action.stageId],
        },
      };
    }

    case 'SET_CHALLENGE_PROGRESS':
      return { ...state, challengeProgress: action.progress };

    case 'UPDATE_CHALLENGE_STEP': {
      if (!state.challengeProgress) return state;
      const steps = [...state.challengeProgress.steps];
      const step = steps[action.stepIndex];
      if (!step) return state;
      steps[action.stepIndex] = { ...step, status: action.status, result: action.result ?? step.result };

      // Auto-unlock next step if current was cleared
      if (action.status === 'cleared' && action.stepIndex + 1 < steps.length) {
        const nextStep = steps[action.stepIndex + 1]!;
        if (nextStep.status === 'locked') {
          steps[action.stepIndex + 1] = { ...nextStep, status: 'unlocked' };
        }
      }

      const allCleared = steps.every((s) => s.status === 'cleared');
      return {
        ...state,
        challengeProgress: { ...state.challengeProgress, steps, allCleared },
      };
    }

    case 'CLAIM_CHALLENGE_BONUS':
      if (!state.challengeProgress) return state;
      return {
        ...state,
        challengeProgress: { ...state.challengeProgress, bonusClaimed: true },
      };

    case 'ADD_TOSS_POINT':
      return {
        ...state,
        tossPointHistory: [action.entry, ...state.tossPointHistory].slice(0, 100),
      };

    default:
      return state;
  }
}

function dayDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00+09:00');
  const b = new Date(dateB + 'T00:00:00+09:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
