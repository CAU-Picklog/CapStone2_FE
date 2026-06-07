/**
 * src/services/spotService.ts
 *
 * GET  /storages/{id}/spots  — Spot 목록 (place 데이터 자동 보강 + 캐시)
 * POST /storages/{id}/spots  — Spot 생성
 * DELETE /storages/{id}/spots/{id} — Spot 삭제
 *
 * ─── Place 데이터 보강 전략 ────────────────────────────────────────────────
 *
 * spots 응답에 place 객체가 없을 경우 GET /places/{id} 로 보강.
 * 매번 재요청을 막기 위해 모듈 레벨 캐시(_placeCache)에 저장.
 * → 화면 재진입 시 캐시 hit → 즉시 반환, 추가 네트워크 없음.
 *
 * ─── 좌표 포맷 처리 ────────────────────────────────────────────────────────
 *
 *   A) { latitude: number, longitude: number }  — POST /places/from-naver
 *   B) { coordinate: "37.xxx,127.xxx" }         — GET /places/{id}
 *   → normalizePlace() 에서 통일
 */

import api from './api';
import { ApiSpot, CreateSpotInput, UpdateSpotInput } from '../types/spot';
import { ApiPlaceDetail } from '../types/place';

// ─── 모듈 레벨 place 캐시 ────────────────────────────────────────────────────
// 앱 세션 동안 유지. 장소 데이터는 자주 바뀌지 않으므로 TTL 없이 사용.
const _placeCache = new Map<number, ApiPlaceDetail>();

/** 캐시 초기화 (로그아웃 등에서 필요 시 호출) */
export function clearPlaceCache(): void {
  _placeCache.clear();
}

// ─── place 정규화 ────────────────────────────────────────────────────────────

function normalizePlace(raw: unknown): ApiPlaceDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const p = raw as Record<string, unknown>;

  if (!p.name || typeof p.name !== 'string') return null;

  let lat = 0;
  let lng = 0;

  if (typeof p.latitude === 'number' && typeof p.longitude === 'number') {
    lat = p.latitude;
    lng = p.longitude;
  } else if (typeof p.latitude === 'string' && typeof p.longitude === 'string') {
    lat = parseFloat(p.latitude);
    lng = parseFloat(p.longitude);
  } else if (typeof p.coordinate === 'string' && p.coordinate.trim()) {
    const parts = p.coordinate.trim().split(',');
    if (parts.length === 2) {
      lat = parseFloat(parts[0].trim());
      lng = parseFloat(parts[1].trim());
    }
  }

  return {
    id: typeof p.id === 'number' ? p.id : Number(p.id ?? 0),
    name: p.name,
    address: typeof p.address === 'string' ? p.address : '',
    category_group: typeof p.category_group === 'string' ? p.category_group : null,
    phone: typeof p.phone === 'string' ? p.phone : null,
    homepage_url: typeof p.homepage_url === 'string' ? p.homepage_url : null,
    latitude: isNaN(lat) ? 0 : lat,
    longitude: isNaN(lng) ? 0 : lng,
    created_at: typeof p.created_at === 'string' ? p.created_at : '',
  };
}

function extractArray(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    for (const key of ['items', 'spots', 'data', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

// ─── 서비스 ─────────────────────────────────────────────────────────────────

const spotService = {
  /**
   * GET /storages/{storageId}/spots
   *
   * 1. 응답 배열 추출 + place 정규화 (중첩/flat 포맷 모두 처리)
   * 2. place 없는 spot → 캐시 확인 → 없으면 GET /places/{id} 병렬 요청
   * 3. 결과를 캐시에 저장해 재진입 시 재요청 없음
   */
  async getSpots(storageId: number): Promise<ApiSpot[]> {
    const res = await api.get<unknown>(`/storages/${storageId}/spots`);

    console.log(`\n[spotService] ── storage ${storageId} ──`);
    console.log('[spotService] raw (500자):', JSON.stringify(res.data)?.slice(0, 500));

    const rawArray = extractArray(res.data);
    console.log(`[spotService] spots 개수: ${rawArray.length}`);

    if (rawArray.length > 0) {
      const first = rawArray[0] as Record<string, unknown>;
      console.log('[spotService] 첫 spot keys:', Object.keys(first));
      console.log('[spotService] 첫 spot.place:', JSON.stringify(first.place)?.slice(0, 200));
    }

    // ── Step 1: place 정규화 (서버에서 준 것 그대로 파싱) ────────
    let spots: ApiSpot[] = rawArray.map((item) => {
      const raw = item as Record<string, unknown>;

      // 포맷 A: 중첩 객체 { place: { ... } }
      if (raw.place && typeof raw.place === 'object') {
        const normalized = normalizePlace(raw.place);
        return { ...(raw as unknown as ApiSpot), place: normalized ?? undefined };
      }

      // 포맷 B: flat 구조 { place_name / name, latitude, ... }
      const flatName = (raw.place_name ?? raw.name) as string | undefined;
      if (flatName) {
        const synthetic = normalizePlace({
          id: raw.place_id,
          name: flatName,
          address: raw.address ?? raw.place_address ?? '',
          latitude: raw.latitude ?? raw.lat,
          longitude: raw.longitude ?? raw.lng,
          coordinate: raw.coordinate,
          category_group: raw.category_group ?? raw.category,
          phone: raw.phone ?? raw.telephone,
          homepage_url: raw.homepage_url,
          created_at: raw.place_created_at ?? raw.created_at,
        });
        if (synthetic) return { ...(raw as unknown as ApiSpot), place: synthetic };
      }

      return { ...(raw as unknown as ApiSpot), place: undefined };
    });

    // ── Step 2: place 없는 spot → 캐시 or API ────────────────────
    const needFetch = [...new Set(
      spots.filter((s) => !s.place?.name).map((s) => s.place_id)
    )];

    const cacheHits = needFetch.filter((id) => _placeCache.has(id));
    const cacheMiss = needFetch.filter((id) => !_placeCache.has(id));

    if (cacheHits.length > 0) {
      console.log(`[spotService] 캐시 hit: ${cacheHits.join(', ')}`);
    }

    if (cacheMiss.length > 0) {
      console.log(`[spotService] 캐시 miss → GET /places/{id} 병렬 요청: ${cacheMiss.join(', ')}`);

      await Promise.all(
        cacheMiss.map(async (placeId) => {
          try {
            const r = await api.get<unknown>(`/places/${placeId}`);
            const normalized = normalizePlace(r.data);
            if (normalized) {
              _placeCache.set(placeId, normalized);
              console.log(`[spotService] 캐시 저장 place ${placeId}: "${normalized.name}" (${normalized.latitude}, ${normalized.longitude})`);
            } else {
              console.warn(`[spotService] place ${placeId} 정규화 실패:`, JSON.stringify(r.data)?.slice(0, 100));
            }
          } catch (e: unknown) {
            const err = e as { response?: { status?: number }; message?: string };
            console.warn(`[spotService] GET /places/${placeId} 실패:`, err?.response?.status ?? err?.message);
          }
        })
      );
    }

    // ── Step 3: 캐시에서 place 데이터 병합 ──────────────────────
    if (needFetch.length > 0) {
      spots = spots.map((spot) => {
        if (spot.place?.name) return spot;
        const cached = _placeCache.get(spot.place_id);
        return cached ? { ...spot, place: cached } : spot;
      });
    }

    console.log('[spotService] 최종:',
      spots.map((s) => `id=${s.id} → "${s.place?.name ?? 'MISSING'}"`).join(', ')
    );

    return spots;
  },

  /** POST /storages/{storageId}/spots */
  async createSpot(storageId: number, input: CreateSpotInput): Promise<ApiSpot> {
    const res = await api.post<ApiSpot>(`/storages/${storageId}/spots`, input);
    return res.data;
  },

  /** PUT /storages/{storageId}/spots/{spotId} */
  async updateSpot(storageId: number, spotId: number, input: UpdateSpotInput): Promise<ApiSpot> {
    const res = await api.put<ApiSpot>(`/storages/${storageId}/spots/${spotId}`, input);
    return res.data;
  },

  /** DELETE /storages/{storageId}/spots/{spotId} */
  async deleteSpot(storageId: number, spotId: number): Promise<void> {
    await api.delete(`/storages/${storageId}/spots/${spotId}`);
  },
};

export default spotService;
