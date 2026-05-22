/**
 * src/types/naver.ts
 * 네이버 로컬 검색 API 응답 타입
 */

/** naverSearchService.searchPlaces() 가 반환하는 정규화된 결과 */
export interface NaverSearchPlace {
  naver_place_id: string;   // 네이버 지도 place ID (URL에서 추출)
  name: string;             // HTML 태그 제거된 장소명
  address: string;          // 지번 주소
  road_address: string;     // 도로명 주소
  category: string;         // 카테고리 (예: "음식점>카페,커피")
  phone: string;            // 전화번호
  latitude: number;
  longitude: number;
}
