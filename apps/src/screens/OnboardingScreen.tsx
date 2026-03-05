import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../game-state/useGameState';
import { TDS } from '../styles/tds';

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
        paddingTop: 'env(safe-area-inset-top, 0px)',
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
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === step ? TDS.blue500 : TDS.grey200,
                transition: 'all 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -- Step 0: 공감 -- */
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
          fontSize: 26,
          fontWeight: 700,
          color: TDS.grey900,
          textAlign: 'center',
          marginBottom: 36,
          lineHeight: 1.4,
        }}
      >
        이런 경험 있으세요?
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              background: TDS.grey50,
              borderRadius: TDS.radius16,
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
          height: 54,
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

/* -- Step 1: 인터랙티브 데모 (함정) -- */
function StepDemo({ onChoice }: { onChoice: (c: 'accept' | 'reject') => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div
        style={{
          background: TDS.grey50,
          borderRadius: TDS.radius16,
          padding: '44px 24px 32px',
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
            marginBottom: 36,
            lineHeight: 1.5,
          }}
        >
          지금 수락하시면 특별 포인트 1,000P를
          <br />
          즉시 지급해드립니다.
        </p>

        <button
          onClick={() => onChoice('accept')}
          style={{
            width: '100%',
            height: 54,
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

/* -- Step 2: 공개 -- */
function StepReveal({
  choice,
  onNext,
}: {
  choice: 'accept' | 'reject';
  onNext: () => void;
}) {
  const gotCaught = choice === 'accept';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 32 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{gotCaught ? '🎣' : '👏'}</div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: gotCaught ? TDS.red500 : TDS.green500,
            marginBottom: 8,
          }}
        >
          {gotCaught ? '걸렸습니다!' : '대단합니다!'}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: TDS.grey700,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {gotCaught
            ? '대부분의 사용자가 크고 눈에 띄는 버튼을 누릅니다.'
            : '작은 거절 버튼을 찾아내셨군요. 하지만 대부분은 못합니다.'}
        </p>
      </div>

      {/* 수치 비교 */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: '"수락" 누르는 영역', value: '17배', sub: '화면 가득 채운 큰 버튼' },
          { label: '"거절" 누르는 영역', value: '1배', sub: '눈에 잘 안 보이는 작은 글씨' },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: i === 0 ? TDS.blue100 : TDS.grey50,
              borderRadius: TDS.radius12,
              padding: '16px 12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: i === 0 ? TDS.blue500 : TDS.grey500,
                marginBottom: 4,
              }}
            >
              {item.value}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TDS.grey900, marginBottom: 2 }}>
              {item.label}
            </div>
            <div style={{ fontSize: 11, color: TDS.grey500 }}>{item.sub}</div>
          </div>
        ))}
      </div>

      {/* 세부 수치 카드 */}
      <div
        style={{
          background: TDS.grey50,
          borderRadius: TDS.radius12,
          padding: '14px 16px',
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {[
          { label: '글씨', accept: '크고 굵게', reject: '작고 얇게' },
          { label: '색상', accept: '눈에 확 띄는 파란색', reject: '배경에 묻히는 회색' },
          { label: '입체감', accept: '튀어나와 보임', reject: '평평하게 숨김' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', fontSize: 13, lineHeight: 1.4 }}>
            <div style={{ width: 52, flexShrink: 0, fontWeight: 600, color: TDS.grey900 }}>
              {row.label}
            </div>
            <div style={{ flex: 1, color: TDS.blue500, fontWeight: 500 }}>{row.accept}</div>
            <div style={{ flex: 1, color: TDS.grey500 }}>{row.reject}</div>
          </div>
        ))}
      </div>

      {/* Before / After 시각 비교 */}
      <div style={{ marginBottom: 28 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: TDS.grey900,
            marginBottom: 12,
            textAlign: 'center',
          }}
        >
          같은 선택지, 다른 설계
        </h3>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* 조작된 설계 */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: TDS.red500,
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              속이는 설계
            </div>
            <div
              style={{
                border: `2px solid ${TDS.red500}20`,
                borderRadius: TDS.radius12,
                padding: '16px 10px 12px',
                background: TDS.white,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: TDS.blue500,
                  color: TDS.white,
                  fontSize: 13,
                  fontWeight: 700,
                  borderRadius: 8,
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(49,130,246,0.3)',
                }}
              >
                네, 받을게요!
              </div>
              <span style={{ fontSize: 9, color: TDS.grey300 }}>아니요, 괜찮습니다</span>
            </div>
          </div>

          {/* 공정한 설계 */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: TDS.green500,
                textAlign: 'center',
                marginBottom: 6,
              }}
            >
              공정한 설계
            </div>
            <div
              style={{
                border: `2px solid ${TDS.green500}20`,
                borderRadius: TDS.radius12,
                padding: '16px 10px 12px',
                background: TDS.white,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: TDS.blue500,
                  color: TDS.white,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                수락
              </div>
              <div
                style={{
                  width: '100%',
                  padding: '10px 0',
                  background: TDS.white,
                  color: TDS.grey900,
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 8,
                  textAlign: 'center',
                  border: `1px solid ${TDS.grey200}`,
                }}
              >
                거절
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        style={{
          width: '100%',
          height: 54,
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

/* -- Step 3: 동기부여 + 시작 -- */
function StepMotivation({ onComplete }: { onComplete: () => void }) {
  const values = [
    { icon: '🎮', title: '체험', desc: '367개의 속이는 설계 스테이지를 직접 플레이' },
    { icon: '📖', title: '학습', desc: '26가지 다크패턴 유형의 원리를 이해' },
    { icon: '🛡️', title: '성장', desc: '속이는 설계를 알아보는 눈을 기르기' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <h2
          style={{
            fontSize: 24,
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
          367개 스테이지 · 26가지 유형
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 44 }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: TDS.grey50,
              borderRadius: TDS.radius16,
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
          height: 54,
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
