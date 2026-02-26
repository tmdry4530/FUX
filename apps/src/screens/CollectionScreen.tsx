import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const difficultyLabel = ['', 'Very Easy', 'Easy', 'Normal', 'Hard', 'Very Hard'];
const difficultyColor = ['', TDS.green500, TDS.green500, TDS.orange500, TDS.red500, TDS.red500];

export function CollectionScreen() {
  const navigate = useNavigate();
  const { cards, totalCount, clearedCount, markViewed } = useCollection();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCardClick = (stageId: string, cleared: boolean) => {
    if (!cleared) return;
    markViewed(stageId);
    setExpandedId((prev) => (prev === stageId ? null : stageId));
  };

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
          onClick={() => navigate('/profile')}
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
          ← 프로필
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
          교육 카드 컬렉션
        </h1>
        <div style={{ width: 52 }} />
      </div>

      {/* 수집 현황 + 진행률 바 */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: TDS.grey900 }}>
            {clearedCount}/{totalCount} 수집
          </span>
          <span style={{ fontSize: 13, color: TDS.grey500 }}>
            {totalCount > 0 ? Math.round((clearedCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <div
          style={{
            height: 6,
            background: TDS.grey200,
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
      </div>

      {/* 카드 그리드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          padding: '0 16px 32px',
        }}
      >
        {cards.map((card) => {
          const isExpanded = expandedId === card.stageId;

          return (
            <div
              key={card.stageId}
              onClick={() => handleCardClick(card.stageId, card.cleared)}
              style={{
                borderRadius: TDS.radius12,
                border: `2px solid ${card.cleared ? TDS.blue500 : TDS.grey200}`,
                background: card.cleared ? TDS.blue100 : TDS.grey50,
                padding: '14px 12px',
                cursor: card.cleared ? 'pointer' : 'default',
                gridColumn: isExpanded ? 'span 2' : 'span 1',
                transition: 'all 0.2s',
              }}
            >
              {card.cleared ? (
                <>
                  {/* 클리어된 카드 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: difficultyColor[card.difficulty],
                        background: TDS.white,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      {difficultyLabel[card.difficulty]}
                    </span>
                    <span style={{ fontSize: 13, color: TDS.blue500, fontWeight: 700 }}>✓</span>
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: TDS.grey900,
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {card.title}
                  </div>
                  {isExpanded && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: '10px 12px',
                        background: TDS.white,
                        borderRadius: TDS.radius8,
                        fontSize: 13,
                        color: TDS.grey700,
                        lineHeight: 1.6,
                        borderLeft: `3px solid ${TDS.blue500}`,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: TDS.blue500, marginBottom: 6 }}>
                        왜 나쁜 UX일까?
                      </div>
                      {card.explainWhyBad}
                    </div>
                  )}
                  {!isExpanded && (
                    <div style={{ fontSize: 12, color: TDS.grey500, marginTop: 4 }}>
                      탭하여 설명 보기
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* 미수집 카드 */}
                  <div style={{ marginBottom: 6 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: TDS.grey500,
                        background: TDS.grey200,
                        borderRadius: 4,
                        padding: '2px 6px',
                      }}
                    >
                      {difficultyLabel[card.difficulty]}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: TDS.grey500,
                      marginBottom: 4,
                      letterSpacing: 2,
                    }}
                  >
                    ???
                  </div>
                  <div style={{ fontSize: 12, color: TDS.grey500 }}>미수집</div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
