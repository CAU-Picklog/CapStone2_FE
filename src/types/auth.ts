/**
 * src/types/auth.ts
 * 인증 관련 타입 정의
 */

export interface User {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  createdAt: string;

  // 친구 관계
  followerCount?: number;   // 나를 팔로우하는 수
  followingCount?: number;  // 내가 팔로우하는 수
  followerIds?: string[];   // 팔로워 ID 목록
  followingIds?: string[];  // 팔로잉 ID 목록
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  nickname: string;
  spaceDNA?: import('./dna').SpaceDNAResult; // 공간 DNA (선택)
}

// ─── 백엔드 API 응답 타입 ───────────────────────────────────────────────────

// GET /users/me, POST /auth/register 응답
export interface ApiUser {
  id: number;
  email: string;
  nickname: string;
  profile_image: string | null;
  created_at: string;
  // 백엔드 UserResponse에 space_dna 없음 — 퀴즈 DNA는 AsyncStorage에만 저장
}

// POST /auth/login 응답
export interface ApiLoginResponse {
  access_token: string;
  token_type: 'bearer';
}
