/**
 * src/services/aiService.ts
 * AI 기능 관련 API 함수 모음
 *
 * 현재는 인터페이스(함수 시그니처)만 정의된 상태입니다.
 * AI 팀이 API를 완성하면 TODO 부분을 채우기.
 * 재호형이나 현민이가 api 주면 그때 연결
 * 담당 기능:
 * - AI 비전 태깅 (이미지 → 자동 태그)
 * - 대표 이미지 자동 선정
 * - AI 공간 큐레이터 추천
 * - 라이징 핫플 분석
 */

import { Place, PlaceTag } from '../types';

// import api from './api';

const aiService = {
  /**
   * 이미지를 분석해서 태그를 자동으로 추출합니다.
   * 실제 API: POST /api/ai/tag-image
   *
   * @param imageUri - 이미지 파일 URI
   * @returns 추출된 태그 목록
   */
  async analyzeImageTags(imageUri: string): Promise<PlaceTag[]> {
    // TODO: AI 팀 연동
    // const formData = new FormData();
    // formData.append('image', { uri: imageUri, type: 'image/jpeg', name: 'photo.jpg' });
    // return (await api.post('/api/ai/tag-image', formData)).data.tags;

    console.log('[aiService] analyzeImageTags - 준비 중:', imageUri);
    return ['cafe', 'hidden_gem']; // Mock
  },

  /**
   * 여러 이미지 중 대표 이미지를 자동으로 선정합니다.
   * 실제 API: POST /api/ai/select-representative
   *
   * @param imageUris - 후보 이미지 URI 목록
   * @returns 대표 이미지 URI
   */
  async selectRepresentativeImage(imageUris: string[]): Promise<string> {
    // TODO: AI 팀 연동
    // return (await api.post('/api/ai/select-representative', { imageUris })).data.uri;

    console.log('[aiService] selectRepresentativeImage - 준비 중');
    return imageUris[0]; // Mock: 일단 첫 번째 이미지 반환
  },

  /**
   * 유저 취향 기반 공간 큐레이터 추천
   * 실제 API: GET /api/ai/curate
   *
   * @param userId - 유저 ID
   * @param limit - 추천 개수
   * @returns 추천 장소 목록
   */
  async getCuratedPlaces(userId: string, limit = 5): Promise<Place[]> {
    // TODO: AI 팀 연동
    // return (await api.get('/api/ai/curate', { params: { userId, limit } })).data;

    console.log('[aiService] getCuratedPlaces - 준비 중:', userId);
    return []; // Mock
  },

  /**
   * 라이징 핫플 분석 (최근 저장 수 급증 장소)
   * 실제 API: GET /api/ai/trending
   *
   * @param limit - 개수
   * @returns 트렌딩 장소 목록
   */
  async getTrendingPlaces(limit = 10): Promise<Place[]> {
    // TODO: AI 팀 연동
    // return (await api.get('/api/ai/trending', { params: { limit } })).data;

    console.log('[aiService] getTrendingPlaces - 준비 중');
    return []; // Mock
  },

  /**
   * 장소 설명 자동 생성
   * 실제 API: POST /api/ai/generate-description
   *
   * @param placeTitle - 장소 이름
   * @param tags - 태그 목록
   * @returns AI가 생성한 설명문
   */
  async generateDescription(placeTitle: string, tags: PlaceTag[]): Promise<string> {
    // TODO: AI 팀 연동
    // return (await api.post('/api/ai/generate-description', { placeTitle, tags })).data.description;

    console.log('[aiService] generateDescription - 준비 중:', placeTitle);
    return ''; // Mock
  },
};

export default aiService;
