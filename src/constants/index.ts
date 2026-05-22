/**
 * src/constants/index.ts
 * 디자인 시스템 토큰 - Variant 디자인 기반
 *
 * THEME: Variant HTML에서 추출한 새 디자인 시스템 (메인)
 * COLORS / FONTS / SPACING: 하위 호환용 (기존 컴포넌트가 참조)
 */

// ─────────────────────────────────────────
// THEME (Variant 디자인 시스템 토큰)
// ─────────────────────────────────────────
export const THEME = {
  colors: {
    // 배경 그라디언트
    bgTop: '#FDF0F6',
    bgMid: '#FFF7EE',
    bgBot: '#FDF2E8',

    // 서피스
    surface: '#FFFFFF',
    surfaceTransparent: 'rgba(255, 255, 255, 0.7)',

    // 텍스트
    textMain: '#111111',
    textMuted: '#8E8E93',
    textPlaceholder: '#C7C7CC',

    // 액센트
    accentSoft: '#F6EBE2',
    accentDark: '#111111',
    tagBg: '#F0F0F5',

    // 시스템
    iosGreen: '#34C759',
    iosGray: '#E9E9EA',
    error: '#FF3B30',

    // 알림 아이콘
    heart: '#FF5E5E',
    heartBg: '#FFF0F0',
    bookmark: '#F2A541',
    bookmarkBg: '#FFF8E6',
    star: '#9B51E0',
    starBg: '#F4F0FF',
    userBlue: '#5E81FF',
    userBlueBg: '#F0F4FF',

    // 설정 아이콘
    iconBlue: '#007AFF',
    iconRed: '#FF3B30',
    iconPurple: '#AF52DE',
    iconOrange: '#FF9500',
    iconGray: '#8E8E93',
  },

  radius: {
    xl: 32,
    lg: 24,
    md: 16,
    sm: 12,
    pill: 999,
  },

  // 그림자 — Platform.select로 native/web 분기
  // 사용: ...Platform.select({ native: THEME.shadow.soft, web: THEME.shadowWeb.soft })
  // 또는 컴포넌트에서 직접 분기
  shadow: {
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
      elevation: 2,
    },
    float: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 4,
    },
    nav: {
      shadowColor: '#FDF2E8',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.8,
      shadowRadius: 15,
      elevation: 8,
    },
  },

  // React Native Web용 boxShadow
  shadowWeb: {
    soft: { boxShadow: '0px 8px 20px rgba(0,0,0,0.04)' },
    float: { boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' },
    nav: { boxShadow: '0px -5px 15px rgba(253,242,232,0.8)' },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  font: {
    size: {
      xs: 11,
      sm: 13,
      md: 15,
      lg: 17,
      xl: 20,
      xxl: 24,
      xxxl: 28,
    },
    weight: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
      extrabold: '800' as const,
    },
  },
} as const;

// ─────────────────────────────────────────
// 하위 호환 export (기존 컴포넌트용)
// ─────────────────────────────────────────
export const COLORS = {
  primary: THEME.colors.accentDark,
  primaryLight: THEME.colors.accentSoft,
  secondary: THEME.colors.heart,
  background: THEME.colors.bgBot,
  white: THEME.colors.surface,
  black: THEME.colors.textMain,
  gray: {
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: THEME.colors.textPlaceholder,
    500: THEME.colors.textMuted,
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529',
  },
  success: THEME.colors.iosGreen,
  warning: '#FFD43B',
  error: THEME.colors.error,
} as const;

export const FONTS = {
  size: THEME.font.size,
  weight: THEME.font.weight,
} as const;

export const SPACING = THEME.spacing;

// ─────────────────────────────────────────
// 지도 기본 설정
// ─────────────────────────────────────────
export const MAP_DEFAULTS = {
  center: {
    latitude: 37.5666805,
    longitude: 126.9784147,
  },
  zoom: 14,
} as const;

// ─────────────────────────────────────────
// 태그 표시 이름 (한국어)
// ─────────────────────────────────────────
export const TAG_LABELS: Record<string, string> = {
  cafe: '카페',
  restaurant: '맛집',
  park: '공원',
  museum: '박물관',
  gallery: '갤러리',
  shopping: '쇼핑',
  nature: '자연',
  historic: '역사',
  nightlife: '나이트라이프',
  hidden_gem: '숨은 명소',
};

// ─────────────────────────────────────────
// API 설정
// ─────────────────────────────────────────
export const API_CONFIG = {
  timeout: 10000,
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080',
} as const;
