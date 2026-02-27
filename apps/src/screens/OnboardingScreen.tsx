import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../game-state/useGameState';

const TDS = {
  grey900: '#191F28',
  grey700: '#4E5968',
  grey500: '#8B95A1',
  grey300: '#D1D6DB',
  grey200: '#E5E8EB',
  grey100: '#F2F4F6',
  grey50: '#F9FAFB',
  blue500: '#3182F6',
  blue600: '#1B64DA',
  green500: '#00C471',
  red500: '#E53935',
  white: '#FFFFFF',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  radius12: 12,
  radius8: 8,
} as const;

type Step = 0 | 1 | 2 | 3;

export function OnboardingScreen() {
  const navigate = useNavigate();
  const { dispatch } = useGameState();
  const [step, setStep] = useState<Step>(0);
  const [demoChoice, setDemoChoice] = useState<'accept' | 'reject' | null>(null);

  const handleComplete = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
    navigate('/', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: TDS.white,
        fontFamily: TDS.fontFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '0 24px',
          boxSizing: 'border-box',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {step === 0 && <StepEmpathy onNext={() => setStep(1)} />}
        {step === 1 && (
          <StepDemo
            onChoice={(c) => {
              setDemoChoice(c);
              setStep(2);
            }}
          />
        )}
        {step === 2 && <StepReveal choice={demoChoice!} onNext={() => setStep(3)} />}
        {step === 3 && <StepMotivation onComplete={handleComplete} />}

        {/* 단계 인디케이터 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            padding: '24px 0 40px',
          }}
        >
          {([0, 1, 2, 3] as const).map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === step ? TDS.blue500 : TDS.grey200,
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Step 0: 공감 ── */
function StepEmpathy({ onNext }: { onNext: () => void }) {
  const cards = [
    {
      emoji: '😤',
      text: '구독 취소 버튼이 어디있는지\n10분째 찾고 있다',
    },
    {
      emoji: '😳',
      text: "분명 '거절'을 눌렀는데\n어느새 동의가 되어 있다",
    },
    {
      emoji: '😡',
      text: '닫기 버튼이 너무 작아서\n광고를 클릭해버렸다',
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: TDS.grey900,
          textAlign: 'center',
          marginBottom: 32,
          lineHeight: 1.4,
        }}
      >
        이런 경험 있으세요?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: TDS.grey50,
              borderRadius: TDS.radius12,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span style={{ fontSize: 32, flexShrink: 0 }}>{card.emoji}</span>
            <p
              style={{
                fontSize: 15,
                color: TDS.grey700,
                margin: 0,
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              {card.text}
            </p>
          </div>
        ))}
      </div>

      <p
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: TDS.grey900,
          textAlign: 'center',
          marginBottom: 24,
        }}
      >
        이건 우연이 아닙니다.
      </p>

      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px 0',
          fontSize: 16,
          fontWeight: 600,
          color: TDS.white,
          background: TDS.blue500,
          border: 'none',
          borderRadius: TDS.radius12,
          cursor: 'pointer',
        }}
      >
        직접 체험해볼까요?
      </button>
    </div>
  );
}

/* ── Step 1: 인터랙티브 데모 (함정) ── */
function StepDemo({ onChoice }: { onChoice: (c: 'accept' | 'reject') => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div
        style={{
          background: TDS.grey50,
          borderRadius: TDS.radius12,
          padding: '40px 24px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: TDS.grey900,
            marginBottom: 8,
          }}
        >
          무료 혜택을 받으시겠습니까?
        </h2>
        <p
          style={{
            fontSize: 14,
            color: TDS.grey500,
            marginBottom: 32,
            lineHeight: 1.5,
          }}
        >
          지금 수락하시면 특별 포인트 1,000P를
          <br />
          즉시 지급해드립니다.
        </p>

        {/* 큰 파란 유도 버튼 */}
        <button
          onClick={() => onChoice('accept')}
          style={{
            width: '100%',
            padding: '18px 0',
            fontSize: 17,
            fontWeight: 700,
            color: TDS.white,
            background: `linear-gradient(135deg, ${TDS.blue500} 0%, ${TDS.blue600} 100%)`,
            border: 'none',
            borderRadius: TDS.radius12,
            cursor: 'pointer',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)',
          }}
        >
          네, 받을게요!
        </button>

        {/* 작은 회색 거절 텍스트 — confirmshaming */}
        <button
          onClick={() => onChoice('reject')}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 11,
            color: TDS.grey300,
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          아니요, 괜찮습니다
        </button>
      </div>
    </div>
  );
}

/* ── Step 2: 공개 ── */
function StepReveal({
  choice,
  onNext,
}: {
  choice: 'accept' | 'reject';
  onNext: () => void;
}) {
  const gotCaught = choice === 'accept';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>{gotCaught ? '🎣' : '👏'}</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: gotCaught ? TDS.red500 : TDS.green500,
            marginBottom: 12,
          }}
        >
          {gotCaught ? '걸렸습니다!' : '대단합니다!'}
        </h2>
        <p
          style={{
            fontSize: 15,
            color: TDS.grey700,
            lineHeight: 1.6,
            marginBottom: 0,
          }}
        >
          {gotCaught
            ? '대부분의 사용자가 크고 눈에 띄는 버튼을 누릅니다.\n이것은 의도적으로 설계된 것입니다.'
            : '작은 거절 버튼을 찾아내셨군요.\n하지만 대부분의 사용자는 그러지 못합니다.'}
        </p>
      </div>

      {/* 설명 카드 */}
      <div
        style={{
          background: TDS.grey50,
          borderRadius: TDS.radius12,
          padding: '24px',
          marginBottom: 32,
        }}
      >
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: TDS.grey900,
            marginBottom: 16,
          }}
        >
          방금 경험한 것: 시각적 위계 조작
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: TDS.white,
                background: TDS.blue500,
                borderRadius: 6,
                padding: '2px 8px',
                flexShrink: 0,
              }}
            >
              유도
            </span>
            <p style={{ fontSize: 14, color: TDS.grey700, margin: 0, lineHeight: 1.5 }}>
              크고, 파랗고, 굵은 글씨의 버튼 — 시선이 자동으로 쏠립니다.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: TDS.white,
                background: TDS.grey500,
                borderRadius: 6,
                padding: '2px 8px',
                flexShrink: 0,
              }}
            >
              숨김
            </span>
            <p style={{ fontSize: 14, color: TDS.grey700, margin: 0, lineHeight: 1.5 }}>
              작고, 회색이고, 배경이 없는 텍스트 — 거의 보이지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%',
          padding: '16px 0',
          fontSize: 16,
          fontWeight: 600,
          color: TDS.white,
          background: TDS.blue500,
          border: 'none',
          borderRadius: TDS.radius12,
          cursor: 'pointer',
        }}
      >
        더 알아보기
      </button>
    </div>
  );
}

/* ── Step 3: 동기부여 + 시작 ── */
function StepMotivation({ onComplete }: { onComplete: () => void }) {
  const values = [
    { icon: '🎮', title: '체험', desc: '367개의 속이는 설계 스테이지를 직접 플레이' },
    { icon: '📖', title: '학습', desc: '26가지 다크패턴 유형의 원리를 이해' },
    { icon: '🛡️', title: '성장', desc: '속이는 설계를 알아보는 눈을 기르기' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: TDS.grey900,
            marginBottom: 8,
            lineHeight: 1.4,
          }}
        >
          속이는 설계를 간파하는 눈을
          <br />
          길러보세요
        </h2>
        <p style={{ fontSize: 14, color: TDS.grey500, margin: 0 }}>
          367개 스테이지 &middot; 26가지 유형
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 40 }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: TDS.grey50,
              borderRadius: TDS.radius12,
              padding: '20px 24px',
            }}
          >
            <span style={{ fontSize: 32, flexShrink: 0 }}>{v.icon}</span>
            <div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: TDS.grey900,
                  marginBottom: 4,
                }}
              >
                {v.title}
              </div>
              <div style={{ fontSize: 14, color: TDS.grey500, lineHeight: 1.4 }}>{v.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onComplete}
        style={{
          width: '100%',
          padding: '18px 0',
          fontSize: 17,
          fontWeight: 700,
          color: TDS.white,
          background: `linear-gradient(135deg, ${TDS.blue500} 0%, ${TDS.blue600} 100%)`,
          border: 'none',
          borderRadius: TDS.radius12,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)',
        }}
      >
        시작하기
      </button>
    </div>
  );
}
