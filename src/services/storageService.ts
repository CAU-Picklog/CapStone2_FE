/**
 * src/services/storageService.ts
 * Storage(보관함) CRUD API
 */

import api from './api';
import { ApiStorage, StorageInput } from '../types';

const storageService = {
  /** GET /storages — 내 Storage 목록 */
  async getStorages(page = 1, size = 20): Promise<ApiStorage[]> {
    const res = await api.get<ApiStorage[]>('/storages', { params: { page, size } });
    return res.data;
  },

  /** GET /storages/{id} — Storage 단건 */
  async getStorageById(id: number): Promise<ApiStorage> {
    const res = await api.get<ApiStorage>(`/storages/${id}`);
    return res.data;
  },

  /** POST /storages — Storage 생성 */
  async createStorage(input: StorageInput): Promise<ApiStorage> {
    const res = await api.post<ApiStorage>('/storages', input);
    return res.data;
  },

  /** PUT /storages/{id} — Storage 수정 */
  async updateStorage(id: number, input: StorageInput): Promise<ApiStorage> {
    const res = await api.put<ApiStorage>(`/storages/${id}`, input);
    return res.data;
  },

  /** DELETE /storages/{id} — Storage 삭제 (204 No Content) */
  async deleteStorage(id: number): Promise<void> {
    await api.delete(`/storages/${id}`);
  },
};

export default storageService;
