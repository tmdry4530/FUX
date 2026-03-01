import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyChallenge } from '../challenge/useDailyChallenge';
import { useAttendance } from '../attendance/useAttendance';
import { useGameState } from '../game-state/useGameState';
import { useRewardedAd } from '../rewards/useRewardedAd';
import { findStageById } from '../stages/findStage';
import { checkAndGrantMilestones } from '../rewards/toss-point-milestones';

const TDS = {
  grey900: '#191F28',
  grey700: '#4E5968',
  grey500: '#8B95A1',
  grey200: '#E5E8EB',
  grey100: '#F2F4F6',
  grey50: '#F9FAFB',
  blue500: '#3182F6',
  blue100: '#E8F3FF',
  red500: '#E53935',
  green500: '#00C471',
  orange500: '#F59F00',
  white: '#FFFFFF',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  radius12: 12,
  radius8: 8,
} as const;

const difficultyLabel = ['', 'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'];

export function DailyChallengeScreen() {
  const navigate = useNavigate();
  const { today, stages, progress, initChallenge, clearedCount, totalSteps } = useDailyChallenge();
  const { attendance, recordToday } = useAttendance();
  const { state, dispatch } = useGameState();
  const { watchAd, loading: adLoading } = useRewardedAd();
  const [adToast, setAdToast] = useState<string | null>(null);

  useEffect(() => {
    initChallenge();
  }, [initChallenge]);

  const steps = progress?.steps ?? [];
  const allCleared = progress?.allCleared ?? false;
  const bonusClaimed = progress?.bonusClaimed ?? false;

  const handleClaimBonus = async () => {
    const bonusEntry = {
      id: `challenge-bonus-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'challenge_bonus' as const,
      amount: 100,
    };
    dispatch({ type: 'ADD_UXP', entry: bonusEntry });
    dispatch({ type: 'CLAIM_CHALLENGE_BONUS' });
    // 6단계 모두 클리어 + 보너스 수령 시에만 출석 기록
    recordToday();
    const updatedState = {
      ...state,
      uxp: {
        total: state.uxp.total + 100,
        entries: [bonusEntry, ...state.uxp.entries],
      },
      challengeProgress: state.challengeProgress
        ? { ...state.challengeProgress, bonusClaimed: true }
        : null,
    };
    await checkAndGrantMilestones(updatedState, (_code, reason, amount) => {
      dispatch({
        type: 'ADD_TOSS_POINT',
        entry: { timestamp: new Date().toISOString(), reason, amount },
      });
    });
  };

  const formattedDate = (() => {
    const [year, month, day] = today.split('-');
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
  })();

  const streakText =
    attendance.currentStreak > 0 ? `연속 ${attendance.currentStreak}일째!` : '첫 도전!';

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100dvh',
        background: TDS.white,
        fontFamily: TDS.fontFamily,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 16px 12px',
          borderBottom: `1px solid ${TDS.grey200}`,
          position: 'sticky',
          top: 0,
          background: TDS.white,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px 4px 0',
            fontSize: 15,
            color: TDS.grey700,
            fontFamily: TDS.fontFamily,
          }}
        >
          ← 홈
        </button>
        <h1
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: 700,
            color: TDS.grey900,
            margin: 0,
          }}
        >
          오늘의 챌린지
        </h1>
        <div style={{ width: 48 }} />
      </div>

      {/* 날짜 & 스트릭 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: TDS.blue100,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, color: TDS.grey700 }}>{formattedDate}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: TDS.blue500 }}>{streakText}</span>
      </div>

      {/* 스텝 목록 */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = steps[i];
          const stageId = step?.stageId ?? stages[i]?.id;
          const stageResult = findStageById(stageId);
          const stage = stageResult?.stage;
          const status = step?.status ?? 'locked';
          const isCleared = status === 'cleared';
          const isFailed = status === 'failed';
          const isUnlocked = status === 'unlocked' || isFailed;
          const isLocked = status === 'locked';
          const uxpEarned = step?.result?.uxpEarned ?? 0;

          return (
            <div
              key={i}
              style={{
                borderRadius: TDS.radius12,
                border: `1px solid ${isCleared ? TDS.green500 : isFailed ? TDS.red500 : isUnlocked ? TDS.blue500 : TDS.grey200}`,
                background: isCleared ? '#F0FBF6' : isFailed ? '#FFF0F0' : isUnlocked ? TDS.blue100 : TDS.grey50,
                padding: '14px 16px',
                opacity: isLocked ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isCleared ? TDS.green500 : isFailed ? TDS.red500 : isUnlocked ? TDS.blue500 : TDS.grey500,
                    }}
                  >
                    STEP {i + 1}
                  </span>
                  {isCleared && (
                    <span style={{ fontSize: 13, color: TDS.green500, fontWeight: 700 }}>
                      ✓ 클리어
                    </span>
                  )}
                  {isFailed && (
                    <span style={{ fontSize: 13, color: TDS.red500, fontWeight: 700 }}>
                      ✗ 실패 · 재도전
                    </span>
                  )}
                  {isUnlocked && !isFailed && (
                    <span style={{ fontSize: 13, color: TDS.blue500, fontWeight: 700 }}>
                      ▶ 도전하기
                    </span>
                  )}
                  {isLocked && (
                    <span style={{ fontSize: 13, color: TDS.grey500 }}>🔒 잠김</span>
                  )}
                </div>
                {isCleared && uxpEarned > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: TDS.green500 }}>
                    +{uxpEarned} UX력
                  </span>
                )}
              </div>

              {stage && !isLocked && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TDS.grey900 }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 2 }}>
                    {difficultyLabel[stage.difficulty]}
                  </div>
                </div>
              )}
              {isLocked && (
                <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: TDS.grey500 }}>
                  ???
                </div>
              )}

              {isUnlocked && stage && !isFailed && (
                <button
                  onClick={() =>
                    navigate(`/stage/${encodeURIComponent(stage.id)}?challenge=1&step=${i}`)
                  }
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '10px',
                    background: TDS.blue500,
                    color: TDS.white,
                    border: 'none',
                    borderRadius: TDS.radius8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: TDS.fontFamily,
                  }}
                >
                  도전하기
                </button>
              )}
              {isFailed && stage && (
                <button
                  onClick={async () => {
                    const ok = await watchAd(stage.id, 0);
                    if (ok) {
                      navigate(`/stage/${encodeURIComponent(stage.id)}?challenge=1&step=${i}`);
                    } else {
                      setAdToast('광고를 시청해야 재도전할 수 있습니다.');
                      setTimeout(() => setAdToast(null), 2500);
                    }
                  }}
                  disabled={adLoading}
                  style={{
                    marginTop: 12,
                    width: '100%',
                    padding: '10px',
                    background: adLoading ? TDS.grey200 : TDS.orange500,
                    color: TDS.white,
                    border: 'none',
                    borderRadius: TDS.radius8,
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: adLoading ? 'default' : 'pointer',
                    fontFamily: TDS.fontFamily,
                  }}
                >
                  {adLoading ? '광고 로딩중...' : '광고 보고 재도전'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 전체 클리어 보너스 */}
      <div
        style={{
          margin: '4px 16px 32px',
          padding: '16px',
          borderRadius: TDS.radius12,
          border: `1px solid ${allCleared && !bonusClaimed ? TDS.orange500 : TDS.grey200}`,
          background: allCleared && !bonusClaimed ? '#FFF9E6' : TDS.grey50,
        }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: TDS.grey900, marginBottom: 4 }}>
          전체 클리어 보너스
        </div>
        <div style={{ fontSize: 13, color: TDS.grey700, marginBottom: 8 }}>
          +100 UX력 + 토스 포인트 10원!
        </div>
        <div style={{ fontSize: 13, color: TDS.grey500, marginBottom: allCleared && !bonusClaimed ? 12 : 0 }}>
          {clearedCount}/{totalSteps} 스텝 클리어
        </div>
        {allCleared && !bonusClaimed && (
          <button
            onClick={handleClaimBonus}
            style={{
              width: '100%',
              padding: '12px',
              background: TDS.orange500,
              color: TDS.white,
              border: 'none',
              borderRadius: TDS.radius8,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: TDS.fontFamily,
            }}
          >
            보너스 받기
          </button>
        )}
        {bonusClaimed && (
          <div style={{ fontSize: 13, color: TDS.green500, fontWeight: 600 }}>
            ✓ 보너스 수령 완료
          </div>
        )}
      </div>

      {/* 광고 필수 토스트 */}
      {adToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            fontSize: 13,
            fontWeight: 600,
            color: TDS.white,
            background: TDS.red500,
            borderRadius: TDS.radius8,
            zIndex: 1000,
            opacity: 0.95,
          }}
        >
          {adToast}
        </div>
      )}
    </div>
  );
}
