/**
 * src/types/invitation.ts
 * 저장소 초대 관련 타입
 */

/** POST /storages/{id}/invitations 요청 */
export interface CreateInvitationInput {
  role: 'editor' | 'viewer';
  expires_in_days: number;
}

/** GET/POST /storages/{id}/invitations 응답 항목 */
export interface ApiInvitation {
  id: number;
  token: string;
  storage_id: number;
  role: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  invited_by_nickname: string;
}

/** GET /invitations/{token} 응답 — 초대 미리보기 */
export interface InvitationPreview {
  storage_id: number;
  storage_title: string;
  role: string;
  inviter_nickname: string;
  expires_at: string;
}

/** POST /invitations/{token}/accept 응답 */
export interface AcceptInvitationResponse {
  storage_id: number;
  user_id: number;
  role: string;
  joined_at: string;
  nickname: string;
  profile_image: string | null;
}
