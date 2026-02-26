import { useMemo } from "react";
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

const TDS = {
  grey900: "#191F28",
  grey700: "#4E5968",
  grey500: "#8B95A1",
  grey200: "#E5E8EB",
  grey100: "#F2F4F6",
  grey50: "#F9FAFB",
  blue500: "#3182F6",
  red500: "#E53935",
  orange500: "#F59F00",
  white: "#FFFFFF",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  radius12: 12,
  radius8: 8,
} as const;

const difficultyLabel = ["", "Very Easy", "Easy", "Normal", "Hard", "Very Hard"];

const allStages: StageSpec[] = [
  ...(stagesV3 as StageSpec[]),
  ...(stagesV2 as StageSpec[]),
  ...(stagesLegacy as StageSpec[]),
  ...(stagesUxhell as StageSpec[]),
];

export function StageListScreen() {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { progress, clearedCount, totalSteps } = useDailyChallenge();
  const { attendance } = useAttendance();
  const { watchAd, loading: adLoading } = useRewardedAd();

  // 하드 챌린지: 난이도 4~5에서 랜덤 3개
  const hardStages = useMemo(() => {
    const pool = allStages.filter((s) => s.difficulty >= 4);
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
    }
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div
      style={{
        padding: "20px 16px",
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: TDS.fontFamily,
        minHeight: "100dvh",
        background: TDS.white,
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: TDS.grey900,
          marginBottom: 4,
          letterSpacing: -0.5,
        }}
      >
        Fuck UX
      </h1>
      <p
        style={{
          fontSize: 15,
          color: TDS.grey500,
          marginBottom: 12,
          lineHeight: 1.5,
        }}
      >
        나쁜 UX를 직접 체험하고, 왜 나쁜지 배워보세요.
      </p>

      {/* UX력 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 14, color: TDS.grey700 }}>
          UX력 <strong style={{ color: TDS.blue500, fontSize: 16 }}>{state.uxp.total.toLocaleString()}</strong>
        </span>
        <button
          onClick={() => navigate('/profile')}
          style={{
            padding: '6px 12px',
            fontSize: 12,
            fontWeight: 600,
            background: TDS.grey100,
            color: TDS.grey700,
            border: 'none',
            borderRadius: TDS.radius8,
            cursor: 'pointer',
          }}
        >
          내 프로필
        </button>
      </div>

      {/* 1. 챌린지 도전 */}
      <button
        onClick={() => navigate('/challenge')}
        style={{
          width: '100%',
          padding: '24px 20px',
          background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
          border: 'none',
          borderRadius: TDS.radius12,
          cursor: 'pointer',
          textAlign: 'left',
          marginBottom: 12,
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
        {/* 진행률 바 */}
        {progress && (
          <div style={{
            marginTop: 12,
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
          if (!adLoading) await watchAd('daily-bonus', 50);
        }}
        disabled={adLoading}
        style={{
          width: '100%',
          padding: '20px',
          background: adLoading
            ? TDS.grey100
            : 'linear-gradient(135deg, #F59F00 0%, #E08E00 100%)',
          border: 'none',
          borderRadius: TDS.radius12,
          cursor: adLoading ? 'default' : 'pointer',
          textAlign: 'left',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: adLoading ? TDS.grey500 : 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
              광고 시청 보상
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: adLoading ? TDS.grey500 : '#fff' }}>
              {adLoading ? '광고 로딩중...' : '광고 보고 UX력 받기'}
            </div>
          </div>
          <span style={{
            fontSize: 14,
            fontWeight: 700,
            color: adLoading ? TDS.grey500 : '#fff',
            background: adLoading ? TDS.grey200 : 'rgba(255,255,255,0.2)',
            padding: '6px 12px',
            borderRadius: TDS.radius8,
          }}>
            +50 UX력
          </span>
        </div>
      </button>

      {/* 3. 더 어려운 도전 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #E53935 0%, #C62828 100%)',
          borderRadius: `${TDS.radius12}px ${TDS.radius12}px 0 0`,
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
            고난이도 · 보상 2배
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
            하드 챌린지
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
            Hard ~ Very Hard 난이도 랜덤 추천
          </div>
        </div>

        {/* 하드 스테이지 목록 */}
        <div style={{
          border: `1px solid ${TDS.grey200}`,
          borderTop: 'none',
          borderRadius: `0 0 ${TDS.radius12}px ${TDS.radius12}px`,
          overflow: 'hidden',
        }}>
          {hardStages.map((stage, index) => {
            const isCleared = state.collection.clearedStageIds.includes(stage.id);
            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
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
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#00C471' }}>✓ 클리어</span>
                    )}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TDS.grey900, lineHeight: 1.4 }}>
                    {stage.title}
                  </div>
                  <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 2 }}>
                    {stage.objective}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/stage/${encodeURIComponent(stage.id)}`)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 13,
                    fontWeight: 700,
                    background: isCleared ? TDS.grey100 : TDS.red500,
                    color: isCleared ? TDS.grey700 : TDS.white,
                    border: 'none',
                    borderRadius: TDS.radius8,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isCleared ? '재도전' : '도전'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
