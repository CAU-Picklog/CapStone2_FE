/**
 * src/services/naverSearchService.ts
 * 네이버 로컬 검색 API 연동
 *
 * 발급: https://developers.naver.com → 애플리케이션 등록 → 사용 API: 검색 > 지역
 * .env 에 두 줄 추가:
 *   EXPO_PUBLIC_NAVER_SEARCH_CLIENT_ID=...
 *   EXPO_PUBLIC_NAVER_SEARCH_CLIENT_SECRET=...
 */

import { NaverSearchPlace } from '../types/naver';

const CLIENT_ID     = process.env.EXPO_PUBLIC_NAVER_SEARCH_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.EXPO_PUBLIC_NAVER_SEARCH_CLIENT_SECRET ?? '';

interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;   // 경도 × 10^7
  mapy: string;   // 위도  × 10^7
}

/** HTML 태그 제거 ("<b>카페</b>" → "카페") */
function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, '');
}

/**
 * 네이버 place ID 추출 — 여러 URL 패턴 대응
 *   /place/1234567890
 *   detail?id=1234567890
 */
function extractPlaceId(link: string): string | null {
  if (!link) return null;
  // 패턴 1: map.naver.com/…/place/1234567890
  const m1 = link.match(/\/place\/(\d+)/);
  if (m1) return m1[1];
  // 패턴 2: store.naver.com/…?id=1234567890
  const m2 = link.match(/[?&]id=(\d+)/);
  if (m2) return m2[1];
  return null;
}

/** Naver mapx/mapy(×10^7) → 위경도 */
function toLatLng(mapx: string, mapy: string) {
  return {
    lat: parseInt(mapy, 10) / 1e7,
    lng: parseInt(mapx, 10) / 1e7,
  };
}

/**
 * link 에서 ID를 못 찾은 경우 대체 ID 생성
 *   전화번호 있으면 tel-{전화번호}
 *   없으면 coord-{mapx}-{mapy}
 */
function fallbackId(item: NaverLocalItem): string {
  if (item.telephone) return `tel-${item.telephone.replace(/[^0-9]/g, '')}`;
  return `coord-${item.mapx}-${item.mapy}`;
}

const naverSearchService = {
  isConfigured(): boolean {
    return Boolean(CLIENT_ID && CLIENT_SECRET);
  },

  async searchPlaces(query: string, display = 15): Promise<NaverSearchPlace[]> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      console.warn('[naverSearch] API 키가 설정되지 않았습니다.');
      return [];
    }

    const url =
      `https://openapi.naver.com/v1/search/local.json` +
      `?query=${encodeURIComponent(query)}&display=${display}&start=1`;

    const response = await fetch(url, {
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('[naverSearch] API 오류:', response.status, text);
      throw new Error(`Naver search error ${response.status}: ${text}`);
    }

    const data = (await response.json()) as { items: NaverLocalItem[] };
    console.log('[naverSearch] 원본 items 수:', data.items?.length ?? 0);
    if (data.items?.length > 0) {
      console.log('[naverSearch] 첫 번째 item link:', data.items[0].link);
    }

    return (data.items ?? []).map((item): NaverSearchPlace => {
      const placeId = extractPlaceId(item.link) ?? fallbackId(item);
      const { lat, lng } = toLatLng(item.mapx, item.mapy);
      return {
        naver_place_id: placeId,
        name: stripHtml(item.title),
        address: item.address,
        road_address: item.roadAddress,
        category: item.category,
        phone: item.telephone,
        latitude: lat,
        longitude: lng,
      };
    });
  },
};

export default naverSearchService;
