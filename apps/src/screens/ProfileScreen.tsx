import { useNavigate } from 'react-router-dom';
import { useGameState } from '../game-state/useGameState';
import { useAttendance } from '../attendance/useAttendance';
import { useCollection } from '../collection/useCollection';

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

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const { state } = useGameState();
  const { attendance, nextMilestone, weekAttendance } = useAttendance();
  const { clearedCount, totalCount } = useCollection();

  const totalTossPoints = state.tossPointHistory.reduce((sum, e) => sum + e.amount, 0);

  // UX력 entries + 토스포인트 history 합쳐서 timestamp 순 정렬, 최근 20개
  type HistoryItem =
    | { kind: 'uxp'; timestamp: string; amount: number; label: string }
    | { kind: 'toss'; timestamp: string; amount: number; reason: string };

  const uxpItems: HistoryItem[] = state.uxp.entries.map((e) => ({
    kind: 'uxp',
    timestamp: e.timestamp,
    amount: e.amount,
    label:
      e.type === 'stage_clear' ? '스테이지 클리어' :
      e.type === 'challenge_step' ? '챌린지 단계' :
      e.type === 'challenge_bonus' ? '챌린지 보너스' :
      e.type === 'attendance' ? '출석 보너스' :
      e.type === 'streak_bonus' ? '연속 출석 보너스' :
      e.type === 'rewarded_ad' ? '광고 보상' :
      e.type === 'first_clear' ? '첫 클리어 보너스' : e.type,
  }));

  const tossItems: HistoryItem[] = state.tossPointHistory.map((e) => ({
    kind: 'toss',
    timestamp: e.timestamp,
    amount: e.amount,
    reason: e.reason,
  }));

  const allHistory = [...uxpItems, ...tossItems]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 20);

  return (
    <div
      style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100dvh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
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
          내 프로필
        </h1>
        <div style={{ width: 48 }} />
      </div>

      <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* UX력 & 토스 포인트 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
            borderRadius: TDS.radius12,
            padding: '20px 20px',
            color: TDS.white,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>총 UX력</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                {state.uxp.total.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>받은 토스 포인트</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totalTossPoints.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* 출석 캘린더 */}
        <div
          style={{
            border: `1px solid ${TDS.grey200}`,
            borderRadius: TDS.radius12,
            padding: '16px',
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: TDS.grey900, marginBottom: 12 }}>
            출석 캘린더
          </div>

          {/* 요일 헤더 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: 600,
                  color: TDS.grey500,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 출석 동그라미 */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
            {weekAttendance.map((attended, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: '1',
                  borderRadius: '50%',
                  background: attended ? TDS.blue500 : TDS.grey100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  color: attended ? TDS.white : TDS.grey500,
                }}
              >
                {attended ? '✓' : '·'}
              </div>
            ))}
          </div>

          {/* 스트릭 */}
          <div style={{ display: 'flex', gap: 16, marginBottom: nextMilestone ? 10 : 0 }}>
            <div>
              <span style={{ fontSize: 13, color: TDS.grey500 }}>현재: </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TDS.blue500 }}>
                {attendance.currentStreak}일 연속
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: TDS.grey500 }}>최장: </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: TDS.grey900 }}>
                {attendance.maxStreak}일
              </span>
            </div>
          </div>

          {/* 다음 마일스톤 */}
          {nextMilestone && nextMilestone.daysLeft > 0 && (
            <div
              style={{
                marginTop: 10,
                padding: '8px 12px',
                background: TDS.blue100,
                borderRadius: TDS.radius8,
                fontSize: 13,
                color: TDS.blue500,
                fontWeight: 600,
              }}
            >
              {nextMilestone.milestone}일 달성 시 토스 포인트 {
                nextMilestone.milestone === 7 ? 30 :
                nextMilestone.milestone === 14 ? 50 : 100
              }원! (앞으로 {nextMilestone.daysLeft}일)
            </div>
          )}
        </div>

        {/* 교육 카드 */}
        <div
          style={{
            border: `1px solid ${TDS.grey200}`,
            borderRadius: TDS.radius12,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: TDS.grey900, marginBottom: 2 }}>
                교육 카드
              </div>
              <div style={{ fontSize: 13, color: TDS.grey500 }}>
                {clearedCount}/{totalCount} 수집
              </div>
            </div>
          </div>

          {/* 진행률 바 */}
          <div
            style={{
              height: 6,
              background: TDS.grey200,
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${totalCount > 0 ? (clearedCount / totalCount) * 100 : 0}%`,
                background: TDS.blue500,
                borderRadius: 3,
                transition: 'width 0.3s',
              }}
            />
          </div>

          <button
            onClick={() => navigate('/collection')}
            style={{
              width: '100%',
              padding: '10px',
              background: TDS.grey100,
              border: 'none',
              borderRadius: TDS.radius8,
              fontSize: 14,
              fontWeight: 600,
              color: TDS.grey900,
              cursor: 'pointer',
              fontFamily: TDS.fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            컬렉션 보기 →
          </button>
        </div>

        {/* UX력 내역 */}
        {allHistory.length > 0 && (
          <div
            style={{
              border: `1px solid ${TDS.grey200}`,
              borderRadius: TDS.radius12,
              padding: '16px',
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: TDS.grey900, marginBottom: 12 }}>
              UX력 내역 (최근 20개)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allHistory.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 12, color: TDS.grey500, marginRight: 8 }}>
                      {formatDate(item.timestamp)}
                    </span>
                    <span style={{ fontSize: 13, color: TDS.grey700 }}>
                      {item.kind === 'uxp' ? item.label : item.reason}
                    </span>
                  </div>
                  {item.kind === 'uxp' ? (
                    <span style={{ fontSize: 13, fontWeight: 700, color: TDS.blue500 }}>
                      +{item.amount} UX력
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: TDS.orange500 }}>
                      토스 포인트 {item.amount}원
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
