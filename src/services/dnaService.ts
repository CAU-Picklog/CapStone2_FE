/**
 * src/services/dnaService.ts
 * 공간 DNA 조회 및 추천 서비스
 *
 * DNA 계산은 AI 팀 서버에서 처리합니다.
 * FE는 결과를 받아 표시하는 역할만 담당합니다.
 *
 * TODO (AI 팀): 아래 TODO 주석 위치에 실제 API 호출 코드를 채워주세요.
 */

import { Place } from '../types';
import { UserSpaceDNA, DNAFilter, PlaceSpaceDNA, derivePlaceDNACode } from '../types/dna';
import { MOCK_PLACES } from './mock/mockPlaces';
import api from './api';

// Mock DNA 응답 (실제 API 실패 시 폴백)
const MOCK_USER_DNA: UserSpaceDNA = {
  userId: 'me',
  code: 'S-M-V',
  score: { D: 35, S: 65, H: 20, M: 80, F: 30, V: 70 },
  placeCount: 6,
  updatedAt: new Date().toISOString(),
};

/**
 * GET /users/me/space-dna 응답을 UserSpaceDNA 포맷으로 정규화
 *
 * 실제 응답 형태:
 * {
 *   has_data: true,
 *   mbti_axes: {
 *     density: { D: 70, S: 30 },
 *     color:   { H: 45, M: 55 },
 *     form:    { F: 60, V: 40 }
 *   },
 *   total_visits: 5,
 *   last_analyzed: "2026-..."
 * }
 */
function normalizeUserDNA(raw: unknown, userId: string): UserSpaceDNA | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // has_data: false → 분석 데이터 없음
  if (r.has_data === false) return null;

  if (r.mbti_axes && typeof r.mbti_axes === 'object') {
    const axes = r.mbti_axes as Record<string, Record<string, number> | number>;

    /**
     * 한 축의 객체에서 "positive side" 값(0~100)을 추출.
     * 온보딩 키: dense/high/fresh  (createSpaceDNA 참고)
     * AI 트리거 키: D/H/F
     * 어느 쪽도 아니면 첫 번째 값 사용
     */
    const pickPositive = (axisVal: unknown): number => {
      if (typeof axisVal === 'number') return axisVal; // 단일 숫자 형태
      if (!axisVal || typeof axisVal !== 'object') return 50;
      const obj = axisVal as Record<string, number>;
      // 온보딩 형태
      if (typeof obj.dense   === 'number') return obj.dense;
      if (typeof obj.high    === 'number') return obj.high;
      if (typeof obj.fresh   === 'number') return obj.fresh;
      // AI 트리거 형태
      if (typeof obj.D === 'number') return obj.D;
      if (typeof obj.H === 'number') return obj.H;
      if (typeof obj.F === 'number') return obj.F;
      // 알 수 없는 키 → 첫 번째 값
      const vals = Object.values(obj).filter((v) => typeof v === 'number');
      return (vals[0] as number) ?? 50;
    };

    const density = pickPositive(axes.density); // dense / D
    const color   = pickPositive(axes.color);   // high  / H
    const form    = pickPositive(axes.form);    // fresh / F

    const D = Math.round(density);      const S = 100 - D;
    const H = Math.round(color);        const M = 100 - H;
    const F2 = Math.round(form);        const V = 100 - F2;

    console.log('[dnaService] normalizeUserDNA axes →', { D, S, H, M, F: F2, V });

    const code = derivePlaceDNACode({ density, color, form });

    return {
      userId,
      code,
      score: { D, S, H, M, F: F2, V },
      placeCount: typeof r.total_visits === 'number' ? r.total_visits : 0,
      updatedAt:  typeof r.last_analyzed === 'string' ? r.last_analyzed : new Date().toISOString(),
    };
  }

  return null;
}

// DNA 코드별 성향 설명 (FE 표시용)
const DNA_DESCRIPTIONS: Record<string, { title: string; description: string; emoji: string }> = {
  'D-H-F': { title: '핫플 헌터형',      description: '항상 최신 핫플을 먼저 찾아다녀요.\n사람 많고 화려하고 트렌디할수록 더 좋은 타입.',  emoji: '⚡' },
  'D-H-V': { title: '레트로 바이브형',  description: '오래된 공간에서 터지는 에너지를 즐겨요.\n북적이는 빈티지 바, 복고풍 클럽이 딱 맞는 타입.', emoji: '🎭' },
  'D-M-F': { title: '소셜 카페형',      description: '사람이 많아도 자극은 적은,\n차분한 모던 카페가 딱 맞아요.',                   emoji: '☕' },
  'D-M-V': { title: '로컬 라이프형',    description: '동네 골목, 재래시장처럼\n사람 냄새 나는 로컬 공간에서 편안함을 느껴요.',      emoji: '🏮' },
  'S-H-F': { title: '갤러리 탐방형',    description: '조용하지만 감각적으로 자극되는\n현대 예술 공간을 즐겨요.',                     emoji: '🎨' },
  'S-H-V': { title: '박물관 러버형',    description: '조용하면서도 풍부한 역사적 자극을 주는\n공간에 매력을 느껴요.',                 emoji: '🏛️' },
  'S-M-F': { title: '힐링 산책형',      description: '조용하고 자극 없는 자연 속\n여유로운 현대 공간을 사랑해요.',                   emoji: '🌿' },
  'S-M-V': { title: '고요한 탐험가형',  description: '사람 없는 조용한 오래된 공간에서\n깊은 사색을 즐겨요.',                        emoji: '🗺️' },
};

const dnaService = {
  /**
   * 유저의 공간 DNA 프로필 조회
   * 실제 API: GET /api/ai/dna/me  (AI 팀)
   *
   * @param userId - 유저 ID
   * @returns UserSpaceDNA (code, score, placeCount 등)
   */
  /**
   * null 반환 = 아직 분석 데이터 없음 (has_data:false) 또는 API 실패
   * Mock으로 절대 폴백하지 않음 → 화면은 퀴즈 DNA(spaceDNA)를 fallback으로 사용
   */
  async getUserDNA(userId: string): Promise<UserSpaceDNA | null> {
    try {
      const res = await api.get<unknown>('/users/me/space-dna');
      const normalized = normalizeUserDNA(res.data, userId);
      if (normalized) {
        console.log('[dnaService] getUserDNA 성공:', normalized.code);
        return normalized;
      }
      console.warn('[dnaService] getUserDNA has_data:false 또는 파싱 실패:', JSON.stringify(res.data)?.slice(0, 100));
      return null;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number }; message?: string };
      console.warn('[dnaService] getUserDNA API 실패 — status:', err?.response?.status, err?.message);
      return null;
    }
  },

  /**
   * DNA 필터 기반 장소 추천
   * 실제 API: POST /api/ai/dna/recommend  (AI 팀)
   *
   * @param filter - 선택한 DNA 축 값 (density, stimulus, temporal)
   * @returns 추천 장소 목록
   */
  async getRecommendations(filter: DNAFilter): Promise<Place[]> {
    // TODO (AI 팀): return (await api.post('/api/ai/dna/recommend', filter)).data;

    // Mock: 필터 미선택 시 전체, 선택 시 앞 3개 반환
    const hasFilter = filter.density || filter.stimulus || filter.temporal;
    return hasFilter ? MOCK_PLACES.slice(0, 3) : MOCK_PLACES;
  },

  /**
   * 장소별 공간 DNA 조회
   * GET /places/{place_id}/space-dna
   *
   * place 화면이 깨지지 않도록 실패 시 null 반환 (에러 전파 안 함)
   */
  async getPlaceSpaceDNA(placeId: number): Promise<PlaceSpaceDNA | null> {
    try {
      console.log('[dnaService] getPlaceSpaceDNA → place_id:', placeId);
      const res = await api.get<PlaceSpaceDNA>(`/places/${placeId}/space-dna`);
      console.log('[dnaService] space-dna response:', JSON.stringify(res.data));
      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown } };
      console.error('[dnaService] space-dna 실패 place_id:', placeId,
        'status:', err?.response?.status,
        'data:', JSON.stringify(err?.response?.data));
      return null;
    }
  },

  /**
   * DNA 코드에 해당하는 성향 설명 반환 (FE 전용, API 불필요)
   */
  getDNADescription(code: string): { title: string; description: string; emoji: string } {
    return (
      DNA_DESCRIPTIONS[code] ?? {
        title: '나만의 취향',
        description: '다양한 공간을 즐기는\n독특한 취향의 소유자예요.',
        emoji: '✨',
      }
    );
  },
};

export default dnaService;
