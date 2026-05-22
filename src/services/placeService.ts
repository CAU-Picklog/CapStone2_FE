/**
 * src/services/placeService.ts
 * 장소(Place) 관련 API 함수 모음입니다.
 *
 * 현재는 Mock 데이터를 반환합니다.
 * 백엔드 연결 시, MOCK_... 부분을 api.get/post/... 로 교체하세요.
 *
 * 사용 예시 (스크린에서):
 *   const places = await placeService.getPlaces();
 *   const place = await placeService.getPlaceById('1');
 */

import {
  Place, CreatePlaceInput, PlaceFilter,
  ApiPlace, ApiPlaceRawData,
  NaverPlaceInput, ApiFromNaverResponse,
} from '../types';
import { MOCK_PLACES } from './mock/mockPlaces';
import api from './api';

// 의도적인 딜레이 (Mock 데이터가 너무 빨리 로드되는 것을 막아 실제 서버처럼 느끼게 함)
const simulateDelay = (ms = 600) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const placeService = {
  /**
   * 전체 장소 목록 조회
   * 실제 API: GET /api/places
   */
  async getPlaces(filter?: PlaceFilter): Promise<Place[]> {
    await simulateDelay();

    // TODO: return (await api.get('/api/places', { params: filter })).data;

    let results = [...MOCK_PLACES];

    // 클라이언트 사이드 필터링 (Mock용)
    if (filter?.keyword) {
      const kw = filter.keyword.toLowerCase();
      results = results.filter(
        (p) =>
          p.title.toLowerCase().includes(kw) ||
          p.address.toLowerCase().includes(kw),
      );
    }
    if (filter?.tags && filter.tags.length > 0) {
      results = results.filter((p) =>
        filter.tags!.some((tag) => p.tags.includes(tag)),
      );
    }
    if (filter?.isPrivate !== undefined) {
      results = results.filter((p) => p.isPrivate === filter.isPrivate);
    }

    return results;
  },

  /**
   * 특정 장소 상세 조회
   * 실제 API: GET /api/places/:id
   */
  async getPlaceById(id: string): Promise<Place | null> {
    await simulateDelay(300);

    // TODO: return (await api.get(`/api/places/${id}`)).data;

    return MOCK_PLACES.find((p) => p.id === id) ?? null;
  },

  /**
   * 새 장소 등록
   * 실제 API: POST /api/places
   */
  async createPlace(input: CreatePlaceInput): Promise<Place> {
    await simulateDelay(800);

    // TODO: return (await api.post('/api/places', input)).data;

    const newPlace: Place = {
      ...input,
      id: String(Date.now()),
      saveCount: 0,
      createdAt: new Date().toISOString(),
    };
    MOCK_PLACES.unshift(newPlace);
    return newPlace;
  },

  /**
   * 장소 저장 (북마크)
   * 실제 API: POST /api/places/:id/save
   */
  async savePlace(id: string): Promise<void> {
    await simulateDelay(200);
    // TODO: await api.post(`/api/places/${id}/save`);
  },

  /**
   * 장소 저장 취소
   * 실제 API: DELETE /api/places/:id/save
   */
  async unsavePlace(id: string): Promise<void> {
    await simulateDelay(200);
    // TODO: await api.delete(`/api/places/${id}/save`);
  },

  /**
   * 라이징 핫플 목록 (trendScore 높은 순)
   * 실제 API: GET /api/places/trending
   */
  async getTrendingPlaces(limit = 5): Promise<Place[]> {
    await simulateDelay(400);
    // TODO: return (await api.get('/api/places/trending', { params: { limit } })).data;

    return [...MOCK_PLACES]
      .sort((a, b) => (b.trendScore ?? 0) - (a.trendScore ?? 0))
      .slice(0, limit);
  },

  // ─── 백엔드 실제 Place API ────────────────────────────────────────────────

  /**
   * 장소 검색 (Spot 생성 시 place_id 획득용)
   * GET /places?q={query}
   */
  async searchPlaces(query: string, page = 1, size = 20): Promise<ApiPlace[]> {
    const response = await api.get<unknown>('/places', {
      params: { q: query, page, size },
    });
    console.log('[searchPlaces] status:', response.status);
    console.log('[searchPlaces] data:', JSON.stringify(response.data));

    // 서버 응답이 배열이면 그대로, 래퍼 객체({ items, data, results 등)면 안쪽 배열 추출
    const raw = response.data;
    if (Array.isArray(raw)) return raw as ApiPlace[];
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      for (const key of ['items', 'data', 'results', 'places']) {
        if (Array.isArray(obj[key])) return obj[key] as ApiPlace[];
      }
    }
    return [];
  },

  /**
   * 네이버 장소 정보로 Place 생성 또는 재사용
   * POST /places/from-naver
   * 이미 DB에 있으면 기존 Place를 반환, 없으면 생성 후 반환
   */
  async createFromNaver(input: NaverPlaceInput): Promise<ApiFromNaverResponse> {
    const res = await api.post<ApiFromNaverResponse>('/places/from-naver', {
      naver_place_id: input.naver_place_id,
      name: input.name,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      category_group: input.category_group ?? null,
      phone: input.phone ?? null,
      homepage_url: input.homepage_url ?? null,
      raw_payload: input.raw_payload ?? { source: 'naver' },
    });
    return res.data;
  },

  /**
   * 장소 단건 조회
   * GET /places/{place_id}
   */
  async getApiPlaceById(id: number): Promise<ApiPlace> {
    const response = await api.get<ApiPlace>(`/places/${id}`);
    return response.data;
  },

  /**
   * 장소 원시 데이터 조회
   * GET /places/{place_id}/raw-data
   */
  async getPlaceRawData(id: number): Promise<ApiPlaceRawData[]> {
    const response = await api.get<ApiPlaceRawData[]>(`/places/${id}/raw-data`);
    return response.data;
  },
};

export default placeService;
