import { useNavigate } from 'react-router-dom';
import { useGameState } from '../game-state/useGameState';
import { useAttendance } from '../attendance/useAttendance';
import { useCollection } from '../collection/useCollection';
import { TDS, cardStyle } from '../styles/tds';

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
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        paddingBottom: 16,
        background: TDS.white,
        fontFamily: TDS.fontFamily,
      }}
    >
      {/* 네비게이션 바 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          padding: '0 16px',
          position: 'sticky',
          top: 0,
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
            fontSize: 16,
            color: TDS.grey900,
            fontFamily: TDS.fontFamily,
          }}
        >
          ←
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
        <div style={{ width: 32 }} />
      </div>

      <div style={{ padding: '8px 12px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* UX력 & 토스 포인트 */}
        <div
          style={{
            background: 'linear-gradient(135deg, #3182F6 0%, #1B64DA 100%)',
            borderRadius: TDS.radius16,
            padding: '24px',
            color: TDS.white,
            boxShadow: '0 4px 12px rgba(49, 130, 246, 0.2)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>총 UX력</div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                {state.uxp.total.toLocaleString()}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>받은 토스 포인트</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>
                {totalTossPoints.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>

        {/* 출석 캘린더 */}
        <div style={cardStyle}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TDS.grey900, marginBottom: 16 }}>
            출석 캘린더
          </div>

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

          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
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
                  color: attended ? TDS.white : TDS.grey400,
                  fontWeight: attended ? 700 : 400,
                }}
              >
                {attended ? '✓' : '·'}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            <div>
              <span style={{ fontSize: 13, color: TDS.grey500 }}>현재 </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: TDS.blue500 }}>
                {attendance.currentStreak}일 연속
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: TDS.grey500 }}>최장 </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: TDS.grey900 }}>
                {attendance.maxStreak}일
              </span>
            </div>
          </div>

          {nextMilestone && nextMilestone.daysLeft > 0 && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 14px',
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
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: TDS.grey900, marginBottom: 2 }}>
                교육 카드
              </div>
              <div style={{ fontSize: 13, color: TDS.grey500 }}>
                {clearedCount}/{totalCount} 수집
              </div>
            </div>
          </div>

          <div
            style={{
              height: 6,
              background: TDS.grey100,
              borderRadius: 3,
              overflow: 'hidden',
              marginBottom: 14,
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
              height: 44,
              background: TDS.grey100,
              border: 'none',
              borderRadius: TDS.radius12,
              fontSize: 14,
              fontWeight: 600,
              color: TDS.grey900,
              cursor: 'pointer',
              fontFamily: TDS.fontFamily,
            }}
          >
            컬렉션 보기 →
          </button>
        </div>

        {/* UX력 내역 */}
        {allHistory.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 16, fontWeight: 700, color: TDS.grey900, marginBottom: 14 }}>
              UX력 내역
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                    <span style={{ fontSize: 12, color: TDS.grey400, marginRight: 8 }}>
                      {formatDate(item.timestamp)}
                    </span>
                    <span style={{ fontSize: 14, color: TDS.grey700 }}>
                      {item.kind === 'uxp' ? item.label : item.reason}
                    </span>
                  </div>
                  {item.kind === 'uxp' ? (
                    <span style={{ fontSize: 14, fontWeight: 700, color: TDS.blue500 }}>
                      +{item.amount}
                    </span>
                  ) : (
                    <span style={{ fontSize: 14, fontWeight: 700, color: TDS.orange500 }}>
                      {item.amount}원
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
