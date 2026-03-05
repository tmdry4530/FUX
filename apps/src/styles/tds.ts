/** Toss Design System (TDS) - 공유 디자인 토큰 */
export const TDS = {
  // Grey scale
  grey900: '#191F28',
  grey800: '#333D4B',
  grey700: '#4E5968',
  grey600: '#6B7684',
  grey500: '#8B95A1',
  grey400: '#B0B8C1',
  grey300: '#D1D6DB',
  grey200: '#E5E8EB',
  grey100: '#F2F4F6',
  grey50: '#F9FAFB',

  // Blue
  blue600: '#1B64DA',
  blue500: '#3182F6',
  blue400: '#4593FC',
  blue100: '#E8F3FF',

  // Semantic
  red500: '#E53935',
  green500: '#00C471',
  orange500: '#F59F00',

  white: '#FFFFFF',

  // Background
  bgGrey: '#F2F4F6',

  // Typography
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

  // Border radius
  radius16: 16,
  radius12: 12,
  radius8: 8,

  // Shadows (토스 스타일 미세 그림자)
  shadowCard: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
  shadowElevated: '0 4px 12px rgba(0, 0, 0, 0.08)',
} as const;

/** 토스 스타일 네비게이션 바 */
export const navBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: 44,
  padding: '0 16px',
  background: TDS.white,
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

/** 토스 스타일 CTA 버튼 (primary) */
export const ctaButtonStyle: React.CSSProperties = {
  width: '100%',
  height: 54,
  fontSize: 16,
  fontWeight: 600,
  color: TDS.white,
  background: TDS.blue500,
  border: 'none',
  borderRadius: TDS.radius12,
  cursor: 'pointer',
  fontFamily: TDS.fontFamily,
};

/** 토스 스타일 CTA 버튼 (secondary / outline) */
export const ctaSecondaryStyle: React.CSSProperties = {
  ...ctaButtonStyle,
  background: TDS.white,
  color: TDS.grey900,
  border: `1px solid ${TDS.grey200}`,
};

/** 토스 스타일 화이트 카드 */
export const cardStyle: React.CSSProperties = {
  background: TDS.white,
  borderRadius: TDS.radius16,
  padding: '20px',
  boxShadow: TDS.shadowCard,
};
