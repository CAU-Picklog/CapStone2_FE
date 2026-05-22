/**
 * src/services/mock/mockInstagram.ts
 * Instagram URL 파싱 Mock 결과 데이터
 * 실제 BE 연동 후 삭제
 */

import { Place } from '../../types';

export const MOCK_INSTAGRAM_PLACES: Place[] = [
  {
    id: 'ig_1',
    title: '성수동 카페 어니언',
    latitude: 37.5447,
    longitude: 127.0556,
    address: '서울 성동구 아차산로9길 8',
    tags: ['cafe', 'hidden_gem'],
    thumbnailUrl: 'https://picsum.photos/seed/onion_cafe/400/300',
    sourceType: 'instagram',
    isPrivate: false,
    saveCount: 812,
    createdAt: '2024-03-15T10:00:00Z',
    description: '성수동 핫플 감성 카페. 넓고 채광 좋은 공간.',
    trendScore: 78,
  },
  {
    id: 'ig_2',
    title: '서울식물원',
    latitude: 37.5683,
    longitude: 126.8289,
    address: '서울 강서구 마곡동로 161',
    tags: ['park', 'nature'],
    thumbnailUrl: 'https://picsum.photos/seed/botanic_garden/400/300',
    sourceType: 'instagram',
    isPrivate: false,
    saveCount: 2334,
    createdAt: '2024-03-20T13:00:00Z',
    description: '온실과 야외정원이 공존하는 도심 식물원.',
    trendScore: 85,
  },
  {
    id: 'ig_3',
    title: '을지로 빈티지 바',
    latitude: 37.566,
    longitude: 126.9924,
    address: '서울 중구 을지로 119',
    tags: ['nightlife', 'historic', 'hidden_gem'],
    thumbnailUrl: 'https://picsum.photos/seed/euljiro_bar/400/300',
    sourceType: 'instagram',
    isPrivate: false,
    saveCount: 543,
    createdAt: '2024-04-01T20:00:00Z',
    description: '을지로 골목의 레트로 감성 바. 낡은 건물 속 현대적 공간.',
    trendScore: 74,
  },
];
