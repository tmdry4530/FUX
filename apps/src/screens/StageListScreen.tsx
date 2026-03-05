import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { StageSpec } from "../stages/stage-spec";
import stagesV3 from "../stages/stages.v3.json";
import stagesV2 from "../stages/stages.v2.json";
import stagesLegacy from "../stages/stages.mvp.json";
import stagesUxhell from "../stages/stages.uxhell.json";
import { useGameState } from "../game-state/useGameState";
import { useDailyChallenge } from "../challenge/useDailyChallenge";
import { useAttendance } from "../attendance/useAttendance";
import { useRewardedAd } from "../rewards/useRewardedAd";
import { getTodayKST } from "../challenge/generateDailyChallenge";
import { TDS, cardStyle } from "../styles/tds";

const difficultyLabel = ["", "Very Easy", "Easy", "Normal", "Hard", "Very Hard"];

const allStages: StageSpec[] = [
  ...(stagesV3 as StageSpec[]),
  ...(stagesV2 as StageSpec[]),
  ...(stagesLegacy as StageSpec[]),
  ...(stagesUxhell as StageSpec[]),
];

export function StageListScreen() {
  const navigate = useNavigate();
  const { state, dispatch } = useGameState();
  const { progress, clearedCount, totalSteps } = useDailyChallenge();
  const { attendance } = useAttendance();
  const { watchAd, loading: adLoading } = useRewardedAd();
  const [adToast, setAdToast] = useState<string | null>(null);

  const today = getTodayKST();
  const toKSTDate = (iso: string) => {
    const d = new Date(iso);
    return new Date(d.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
  };
  const dailyAdClaimed = state.uxp.entries.some(
    (e) => e.type === 'rewarded_ad' && e.stageId === 'daily-bonus' && toKSTDate(e.timestamp) === today
  );

  const hc = state.hardChallenge;
  const hcToday = hc && hc.date === today;
  const hcPlayCount = hcToday ? hc.playCount : 0;
  const hcAdWatchCount = hcToday ? hc.adWatchCount : 0;
  const hcCanPlayFree = hcPlayCount < 1;
  const hcCanWatchAd = hcPlayCount >= 1 && hcAdWatchCount < 2;
  const hcExhausted = hcPlayCount >= 3;

  const hardStages = useMemo(() => {
    let seed = 0;
    for (let i = 0; i < today.length; i++) {
      seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0;
    }
    const seededRandom = () => {
      seed = (seed * 1664525 + 1013904223) | 0;
      return ((seed >>> 0) / 0x100000000);
    };

    const pool = allStages.filter((s) => s.difficulty >= 4);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    const seen = new Set<string>();
    return shuffled.filter((s) => {
      if (seen.has(s.type)) return false;
      seen.add(s.type);
      return true;
    }).slice(0, 3);
  }, [today]);

  return (
    <div
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        maxWidth: 480,
        margin: '0 auto',
        fontFamily: TDS.fontFamily,
        minHeight: '100dvh',
        background: TDS.bgGrey,
      }}
    >
      {/* 상단 헤더 영역 (화이트) */}
      <div
        style={{
          background: TDS.white,
          padding: '20px 20px 20px',
          borderRadius: `0 0 ${TDS.radius16}px ${TDS.radius16}px`,
          boxShadow: TDS.shadowCard,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: TDS.grey900, marginBottom: 4, letterSpacing: -0.5 }}>
              일부러 불편한 앱
            </h1>
            <p style={{ fontSize: 13, color: TDS.grey500, lineHeight: 1.4 }}>
              나쁜 UX를 직접 체험하고, 왜 나쁜지 배워보세요.
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: 600,
              background: TDS.grey100, color: TDS.grey700,
              border: 'none', borderRadius: 20, cursor: 'pointer',
            }}
          >
            내 프로필
          </button>
        </div>

        {/* UX력 표시 */}
        <div
          style={{
            background: TDS.blue100,
            borderRadius: TDS.radius12,
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, color: TDS.grey700 }}>총 UX력</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: TDS.blue500 }}>
            {state.uxp.total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 카드 영역 */}
      <div style={{ padding: '0 12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* 1. 오늘의 챌린지 */}
        <button
          onClick={() => navigate('/challenge')}
          style={{
            width: '100%',
            padding: '20px',
            background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
            border: 'none',
            borderRadius: TDS.radius16,
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: '0 4px 12px rgba(49, 130, 246, 0.2)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
            매일 새로운 6단계
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
            오늘의 챌린지
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
              {progress ? `${clearedCount}/${totalSteps} 완료` : '도전하기'}
              {attendance.currentStreak > 0 && ` · 연속 ${attendance.currentStreak}일째!`}
            </div>
            <span style={{ fontSize: 22, color: '#fff' }}>→</span>
          </div>
          {progress && (
            <div style={{
              marginTop: 14,
              height: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.25)',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(clearedCount / totalSteps) * 100}%`,
                background: '#fff',
                borderRadius: 2,
                transition: 'width 0.3s',
              }} />
            </div>
          )}
        </button>

        {/* 2. 광고 보고 보상 받기 */}
        <button
          onClick={async () => {
            if (!adLoading && !dailyAdClaimed) {
              const ok = await watchAd('daily-bonus', 10);
              if (ok) {
                dispatch({
                  type: 'ADD_UXP',
                  entry: {
                    id: `ad-daily-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    type: 'rewarded_ad',
                    amount: 10,
                    stageId: 'daily-bonus',
                  },
                });
                setAdToast('+10 UX력 획득!');
                setTimeout(() => setAdToast(null), 2500);
              } else {
                setAdToast('광고를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
                setTimeout(() => setAdToast(null), 3000);
              }
            }
          }}
          disabled={adLoading || dailyAdClaimed}
          style={{
            width: '100%',
            padding: '20px',
            background: adLoading || dailyAdClaimed
              ? TDS.white
              : 'linear-gradient(135deg, #F59F00 0%, #E08E00 100%)',
            border: 'none',
            borderRadius: TDS.radius16,
            cursor: adLoading || dailyAdClaimed ? 'default' : 'pointer',
            textAlign: 'left',
            boxShadow: adLoading || dailyAdClaimed ? TDS.shadowCard : '0 4px 12px rgba(245, 159, 0, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: adLoading || dailyAdClaimed ? TDS.grey500 : 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
                광고 시청 보상
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: adLoading || dailyAdClaimed ? TDS.grey500 : '#fff' }}>
                {dailyAdClaimed ? '오늘 보상 수령 완료' : adLoading ? '광고 로딩중...' : '광고 보고 UX력 받기'}
              </div>
            </div>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: adLoading || dailyAdClaimed ? TDS.grey500 : '#fff',
              background: adLoading || dailyAdClaimed ? TDS.grey100 : 'rgba(255,255,255,0.2)',
              padding: '8px 14px',
              borderRadius: 20,
            }}>
              +10 UX력
            </span>
          </div>
        </button>

        {/* 3. 하드 챌린지 */}
        <div
          style={{
            ...cardStyle,
            padding: 0,
            overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
                고난이도 · 보상 2배
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>
                오늘 {hcPlayCount}/3회 도전
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              하드 챌린지
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
              Hard ~ Very Hard 난이도 · 1회 무료, 광고 시청 시 최대 3회
            </div>
          </div>

          {hardStages.map((stage, index) => {
            const isCleared = state.collection.clearedStageIds.includes(stage.id);
            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 20px",
                  borderBottom: index < hardStages.length - 1 ? `1px solid ${TDS.grey100}` : 'none',
                  background: isCleared ? '#F0FBF6' : TDS.white,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TDS.red500 }}>
                      {difficultyLabel[stage.difficulty]}
                    </span>
                    {isCleared && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: TDS.green500 }}>✓ 클리어</span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TDS.grey900, lineHeight: 1.4 }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 2 }}>
                    {stage.objective}
                  </div>
                </div>
                {isCleared ? (
                  <span
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: TDS.green500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    완료
                  </span>
                ) : hcExhausted ? (
                  <button
                    disabled
                    style={{
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      background: TDS.grey100,
                      color: TDS.grey500,
                      border: 'none',
                      borderRadius: 20,
                      cursor: 'default',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    소진
                  </button>
                ) : hcCanPlayFree ? (
                  <button
                    onClick={() => {
                      dispatch({ type: 'PLAY_HARD_CHALLENGE' });
                      navigate(`/stage/${encodeURIComponent(stage.id)}?hard=1`);
                    }}
                    style={{
                      padding: '8px 18px',
                      fontSize: 13,
                      fontWeight: 700,
                      background: TDS.red500,
                      color: TDS.white,
                      border: 'none',
                      borderRadius: 20,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    도전
                  </button>
                ) : hcCanWatchAd ? (
                  <button
                    onClick={async () => {
                      const ok = await watchAd(stage.id);
                      if (ok) {
                        dispatch({ type: 'WATCH_HARD_AD' });
                        dispatch({ type: 'PLAY_HARD_CHALLENGE' });
                        navigate(`/stage/${encodeURIComponent(stage.id)}?hard=1`);
                      } else {
                        setAdToast('광고를 시청해야 도전할 수 있습니다.');
                        setTimeout(() => setAdToast(null), 2500);
                      }
                    }}
                    disabled={adLoading}
                    style={{
                      padding: '8px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      background: adLoading ? TDS.grey100 : TDS.orange500,
                      color: adLoading ? TDS.grey500 : TDS.white,
                      border: 'none',
                      borderRadius: 20,
                      cursor: adLoading ? 'default' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {adLoading ? '로딩...' : '광고 보고 도전'}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* 토스트 */}
      {adToast && (
        <div
          style={{
            position: "fixed",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "12px 24px",
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
