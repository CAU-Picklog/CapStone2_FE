/**
 * src/types/place.ts
 * 장소(Place) 관련 핵심 타입 정의
 *
 * 확장 포인트:
 * - AI 비전 태깅 결과 → aiTags 필드
 * - 대표 이미지 자동 선정 → representativeImage 필드
 * - 협업형 공동 컬렉션 → collectionIds 필드
 * - 라이징 핫플 → trendScore 필드
 */

// 장소 데이터 출처 (직접 등록, 인스타그램 등)
export type SourceType = 'manual' | 'instagram' | 'kakao' | 'google' | 'ai_suggestion';

// 장소 카테고리 태그
export type PlaceTag =
  | 'cafe'
  | 'restaurant'
  | 'park'
  | 'museum'
  | 'gallery'
  | 'shopping'
  | 'nature'
  | 'historic'
  | 'nightlife'
  | 'hidden_gem'
  | string; // 커스텀 태그 허용

// 장소의 핵심 데이터 타입
export interface Place {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  address: string;
  tags: PlaceTag[];
  thumbnailUrl: string;
  sourceType: SourceType;
  isPrivate: boolean;
  saveCount: number;
  createdAt: string; // ISO 8601 형식 (예: "2024-03-01T12:00:00Z")

  // 선택적 필드 (나중에 채워질 예정)
  description?: string;
  images?: string[];           // 여러 이미지 URL
  aiTags?: string[];           // AI 비전 태깅 결과
  trendScore?: number;         // 라이징 핫플 점수 (0~100)
  collectionIds?: string[];    // 속한 공동 컬렉션 ID 목록
  representativeImage?: string; // AI가 선정한 대표 이미지

  // 커뮤니티 관련
  createdBy?: string;          // 최초 등록한 유저 ID
  contributors?: PlaceContributor[]; // 공동 기여자 목록
}

// 장소에 기여한 유저 정보
export interface PlaceContributor {
  userId: string;
  nickname: string;
  profileImageUrl?: string;
  contributionType: 'tag' | 'image' | 'description' | 'save'; // 기여 유형
  contributedAt: string;
}

// 장소 생성 시 사용하는 타입 (id, saveCount 등 서버가 생성하는 필드 제외)
export type CreatePlaceInput = Omit<Place, 'id' | 'saveCount' | 'createdAt' | 'aiTags' | 'trendScore'>;

// 지도에 표시할 마커 최소 정보
export interface MapMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
}

// 장소 필터 옵션 (검색/필터링에 사용)
export interface PlaceFilter {
  tags?: PlaceTag[];
  isPrivate?: boolean;
  sourceType?: SourceType;
  keyword?: string;
}

// ─── 백엔드 API 응답 타입 ───────────────────────────────────────────────────

// GET /places, GET /places/{id} 응답 (좌표가 "lat,lng" 문자열)
export interface ApiPlace {
  id: number;
  name: string;
  address: string;
  coordinate: string | null;
  category_group: string | null;
  phone: string | null;
  homepage_url: string | null;
  created_at: string;
}

// POST /places/from-naver 의 place 객체 (좌표가 number 필드로 분리됨)
export interface ApiPlaceDetail {
  id: number;
  name: string;
  address: string;
  category_group: string | null;
  phone: string | null;
  homepage_url: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

// POST /places/from-naver 응답
export interface ApiFromNaverResponse {
  place_id: number;
  created: boolean;
  place: ApiPlaceDetail;
}

// POST /places/from-naver 요청 바디
export interface NaverPlaceInput {
  naver_place_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category_group?: string;
  phone?: string;
  homepage_url?: string;
  raw_payload?: Record<string, unknown>;
}

// GET /places/{id}/raw-data 응답
export interface ApiPlaceRawData {
  id: number;
  place_id: number;
  provider: string;
  provider_place_id: string;
  raw_payload: Record<string, unknown>;
  collected_at: string;
}
