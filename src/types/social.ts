/**
 * src/types/social.ts
 * 커뮤니티/소셜 관련 타입 정의
 *
 * 확장 포인트:
 * - 피드 알림 → Notification 타입
 * - 댓글/리액션 → Comment, Reaction 타입
 * - 공개 컬렉션 탐색 → CollectionExplore 타입
 */

import { Place, PlaceTag } from './place';

// ─── 친구 관계 ────────────────────────────────────────────

export type FriendStatus = 'pending' | 'accepted' | 'blocked';

export interface FriendRelation {
  id: string;
  fromUserId: string;    // 요청 보낸 유저
  toUserId: string;      // 요청 받은 유저
  status: FriendStatus;
  createdAt: string;
}

// 피드/프로필에서 보여줄 유저 요약 정보
export interface UserSummary {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  followerCount?: number;
}

// ─── 피드 ─────────────────────────────────────────────────

// 피드에 표시될 활동 유형
export type FeedActivityType =
  | 'place_saved'        // 친구가 장소를 저장함
  | 'tag_added'          // 친구가 장소에 태그를 추가함
  | 'place_created'      // 친구가 새 장소를 등록함
  | 'collection_updated' // 공동 컬렉션이 업데이트됨
  | 'friend_joined';     // 새 친구가 앱에 가입함

export interface FeedItem {
  id: string;
  activityType: FeedActivityType;
  actor: UserSummary;       // 활동한 유저
  place?: Pick<Place, 'id' | 'title' | 'address' | 'thumbnailUrl' | 'tags'>; // 관련 장소
  collection?: Pick<SharedCollection, 'id' | 'title'>;  // 관련 컬렉션
  addedTag?: PlaceTag;      // 추가된 태그 (tag_added 활동 시)
  createdAt: string;
}

// ─── 공동 컬렉션 ──────────────────────────────────────────

export interface SharedCollection {
  id: string;
  title: string;
  description?: string;
  coverImageUrl?: string;
  ownerId: string;                 // 컬렉션 생성자
  memberIds: string[];             // 참여 중인 유저 ID 목록
  placeIds: string[];              // 담긴 장소 ID 목록
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}
