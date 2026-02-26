import { getTodayKST } from '../challenge/generateDailyChallenge';

/** 날짜 차이 (KST) */
export function dayDiff(dateA: string, dateB: string): number {
  const a = new Date(dateA + 'T00:00:00+09:00');
  const b = new Date(dateB + 'T00:00:00+09:00');
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** 오늘 출석 기록이 있는지 */
export function isAttendedToday(attendedDates: string[]): boolean {
  return attendedDates.includes(getTodayKST());
}

/** 다음 출석 마일스톤까지 남은 일수 */
export function daysUntilNextMilestone(currentStreak: number): { milestone: number; daysLeft: number } {
  const milestones = [7, 14, 30];
  for (const m of milestones) {
    if (currentStreak < m) {
      return { milestone: m, daysLeft: m - currentStreak };
    }
  }
  return { milestone: 30, daysLeft: 0 };
}

/** 이번 주 출석 현황 (일~토) */
export function getWeekAttendance(attendedDates: string[]): boolean[] {
  const todayStr = getTodayKST();
  // UTC noon을 사용하여 타임존 날짜 시프트 방지
  const today = new Date(todayStr + 'T12:00:00Z');
  const dayOfWeek = today.getUTCDay(); // 0 = Sunday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - dayOfWeek + i);
    const dateStr = d.toISOString().slice(0, 10);
    return attendedDates.includes(dateStr);
  });
}
