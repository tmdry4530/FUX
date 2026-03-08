import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDailyChallenge } from '../challenge/useDailyChallenge';
import { useAttendance } from '../attendance/useAttendance';
import { useGameState } from '../game-state/useGameState';
import { useRewardedAd } from '../rewards/useRewardedAd';
import { findStageById } from '../stages/findStage';
import { checkAndGrantMilestones } from '../rewards/toss-point-milestones';
import { TDS, cardStyle } from '../styles/tds';

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
      amount: 50,
    };
    dispatch({ type: 'ADD_UXP', entry: bonusEntry });
    dispatch({ type: 'CLAIM_CHALLENGE_BONUS' });
    recordToday();
    const updatedState = {
      ...state,
      uxp: {
        total: state.uxp.total + 50,
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
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 36px)',
        paddingBottom: 8,
        background: TDS.white,
        fontFamily: TDS.fontFamily,
      }}
    >
      {/* 헤더: 뒤로가기 + 날짜 & 스트릭 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 20px 6px',
          gap: 10,
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px 4px 0',
            fontSize: 16,
            color: TDS.grey900,
            fontFamily: TDS.fontFamily,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: TDS.grey900 }}>오늘의 챌린지</div>
          <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 2 }}>{formattedDate}</div>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: TDS.blue500 }}>{streakText}</span>
      </div>

      {/* 스텝 목록 */}
      <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
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
                ...cardStyle,
                padding: '10px 16px',
                opacity: isLocked ? 0.55 : 1,
                borderLeft: `4px solid ${isCleared ? TDS.green500 : isFailed ? TDS.red500 : isUnlocked ? TDS.blue500 : TDS.grey200}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: isCleared ? TDS.green500 : isFailed ? TDS.red500 : isUnlocked ? TDS.blue500 : TDS.grey500,
                      letterSpacing: 0.5,
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
                      ✗ 실패
                    </span>
                  )}
                  {isUnlocked && !isFailed && (
                    <span style={{ fontSize: 13, color: TDS.blue500, fontWeight: 700 }}>
                      도전 가능
                    </span>
                  )}
                  {isLocked && (
                    <span style={{ fontSize: 13, color: TDS.grey500 }}>잠김</span>
                  )}
                </div>
                {isCleared && uxpEarned > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: TDS.green500 }}>
                    +{uxpEarned} UX력
                  </span>
                )}
              </div>

              {stage && !isLocked && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: TDS.grey900 }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: 11, color: TDS.grey500, marginTop: 1 }}>
                    {difficultyLabel[stage.difficulty]}
                  </div>
                </div>
              )}
              {isLocked && (
                <div style={{ marginTop: 6, fontSize: 14, fontWeight: 600, color: TDS.grey400 }}>
                  ???
                </div>
              )}

              {isUnlocked && stage && !isFailed && (
                <button
                  onClick={() =>
                    navigate(`/stage/${encodeURIComponent(stage.id)}?challenge=1&step=${i}`)
                  }
                  style={{
                    marginTop: 8,
                    width: '100%',
                    height: 40,
                    background: TDS.blue500,
                    color: TDS.white,
                    border: 'none',
                    borderRadius: TDS.radius12,
                    fontSize: 15,
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
                    marginTop: 8,
                    width: '100%',
                    height: 40,
                    background: adLoading ? TDS.grey200 : TDS.orange500,
                    color: TDS.white,
                    border: 'none',
                    borderRadius: TDS.radius12,
                    fontSize: 15,
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
          margin: '6px 12px 12px',
          ...cardStyle,
          padding: '12px 16px',
          borderLeft: `4px solid ${allCleared && !bonusClaimed ? TDS.orange500 : TDS.grey200}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TDS.grey900 }}>
              전체 클리어 보너스
            </div>
            <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 2 }}>
              {clearedCount}/{totalSteps} 클리어 · +50 UX력 + 10원
            </div>
          </div>
          {allCleared && !bonusClaimed && (
            <button
              onClick={handleClaimBonus}
              style={{
                padding: '8px 18px',
                background: TDS.orange500,
                color: TDS.white,
                border: 'none',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: TDS.fontFamily,
                whiteSpace: 'nowrap',
              }}
            >
              보너스 받기
            </button>
          )}
          {bonusClaimed && (
            <span style={{ fontSize: 13, color: TDS.green500, fontWeight: 700, whiteSpace: 'nowrap' }}>
              ✓ 수령 완료
            </span>
          )}
        </div>
      </div>

      {/* 토스트 */}
      {adToast && (
        <div
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            color: TDS.white,
            background: TDS.grey900,
            borderRadius: 24,
            zIndex: 1000,
            boxShadow: TDS.shadowElevated,
          }}
        >
          {adToast}
        </div>
      )}
    </div>
  );
}
