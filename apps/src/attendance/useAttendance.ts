import { useCallback } from 'react';
import { useGameState } from '../game-state/useGameState';
import { getTodayKST } from '../challenge/generateDailyChallenge';
import { isAttendedToday, daysUntilNextMilestone, getWeekAttendance } from './streak-calculator';

export function useAttendance() {
  const { state, dispatch } = useGameState();
  const { attendance } = state;

  const recordToday = useCallback(() => {
    const today = getTodayKST();
    if (!attendance.attendedDates.includes(today)) {
      dispatch({ type: 'RECORD_ATTENDANCE', date: today });
    }
  }, [attendance.attendedDates, dispatch]);

  return {
    attendance,
    isToday: isAttendedToday(attendance.attendedDates),
    nextMilestone: daysUntilNextMilestone(attendance.currentStreak),
    weekAttendance: getWeekAttendance(attendance.attendedDates),
    recordToday,
  };
}
