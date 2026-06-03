/**
 * src/navigation/types.ts
 * 네비게이션 파라미터 타입 정의
 */

import { SpaceDNAResult, ApiPlaceDetail } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  /**
   * placeId:   mock store 조회용 문자열 ID (기존 호환)
   * apiPlace:  네이버 검색으로 등록한 실제 Place 데이터 (새 흐름)
   */
  PlaceDetail: { placeId: string; apiPlace?: ApiPlaceDetail; spotImages?: string[] };
  AddPlace: undefined;
  Login: undefined;
  Signup: undefined;
  SpaceDNAQuiz: { email: string; password: string; nickname: string };
  SpaceDNAResult: { email: string; password: string; nickname: string; spaceDNA: SpaceDNAResult };
  Settings: undefined;
  Notifications: undefined;
  InstagramImport: undefined;
  Profile: undefined;
  Recommendation: {
    initialDensity?: string;
    initialStimulus?: string;
    initialTemporal?: string;
  };
  DNAGuide: undefined;
  CollaborativeMap: undefined;
};

export type TabParamList = {
  Home: undefined;
  Map: undefined;
  Saved: undefined;
  Feed: undefined;
};
