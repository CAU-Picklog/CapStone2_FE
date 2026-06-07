/**
 * src/services/invitationService.ts
 * 저장소 초대 관련 API
 */

import api from './api';
import {
  ApiInvitation,
  CreateInvitationInput,
  InvitationPreview,
  AcceptInvitationResponse,
} from '../types/invitation';

const invitationService = {
  /** POST /storages/{storageId}/invitations — 초대 토큰 생성 (owner 전용) */
  async createInvitation(storageId: number, input: CreateInvitationInput): Promise<ApiInvitation> {
    const res = await api.post<ApiInvitation>(`/storages/${storageId}/invitations`, input);
    return res.data;
  },

  /** GET /storages/{storageId}/invitations — 활성 초대 목록 (owner 전용) */
  async getInvitations(storageId: number): Promise<ApiInvitation[]> {
    const res = await api.get<ApiInvitation[]>(`/storages/${storageId}/invitations`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** DELETE /storages/{storageId}/invitations/{invitationId} — 초대 취소 (owner 전용) */
  async revokeInvitation(storageId: number, invitationId: number): Promise<void> {
    await api.delete(`/storages/${storageId}/invitations/${invitationId}`);
  },

  /** GET /invitations/{token} — 초대 미리보기 (인증 필수) */
  async previewInvitation(token: string): Promise<InvitationPreview> {
    const res = await api.get<InvitationPreview>(`/invitations/${token}`);
    return res.data;
  },

  /** POST /invitations/{token}/accept — 초대 수락 */
  async acceptInvitation(token: string): Promise<AcceptInvitationResponse> {
    const res = await api.post<AcceptInvitationResponse>(`/invitations/${token}/accept`);
    return res.data;
  },

  /** POST /invitations/{token}/decline — 초대 거절 (204) */
  async declineInvitation(token: string): Promise<void> {
    await api.post(`/invitations/${token}/decline`);
  },
};

export default invitationService;
