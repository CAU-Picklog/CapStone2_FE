/**
 * src/types/spot.ts
 * Spot (보관함에 저장된 장소 기록) 관련 타입
 *
 * 관계:
 *   Storage(보관함) 1 ──< Spot N >── Place 1
 */

import { ApiPlaceDetail } from './place';

/** GET /storages/{id}/spots 응답 항목 */
export interface ApiSpot {
  id: number;
  storage_id: number;
  place_id: number;
  place?: ApiPlaceDetail;          // 서버가 조인해서 줄 때만 존재
  instagram_url: string | null;
  thumbnail_url: string | null;
  image_urls?: string[] | null;
  user_memo: string;
  user_rating: number | null;
  is_visited: boolean;
  created_at: string;
}

/** POST /storages/{id}/spots 요청 바디 */
export interface CreateSpotInput {
  place_id: number;
  instagram_url?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[] | null;
  user_memo?: string;
  user_rating?: number | null;
}

/** PUT /storages/{storage_id}/spots/{spot_id} 요청 바디 */
export interface UpdateSpotInput {
  instagram_url?: string | null;
  thumbnail_url?: string | null;
  user_memo?: string;
  user_rating?: number | null;
  is_visited?: boolean;
}
