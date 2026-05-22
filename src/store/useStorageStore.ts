/**
 * src/store/useStorageStore.ts
 * Storage(보관함) 전역 상태 (Zustand)
 */

import create from 'zustand';
import { ApiStorage } from '../types';
import storageService from '../services/storageService';

interface StorageState {
  storages: ApiStorage[];
  isLoading: boolean;
  error: string | null;

  fetchStorages: () => Promise<void>;
  createStorage: (title: string, description?: string, isPublic?: boolean) => Promise<void>;
  updateStorage: (id: number, title: string, description?: string, isPublic?: boolean) => Promise<void>;
  deleteStorage: (id: number) => Promise<void>;
  clearError: () => void;
}

export const useStorageStore = create<StorageState>((set, get) => ({
  storages: [],
  isLoading: false,
  error: null,

  fetchStorages: async () => {
    set({ isLoading: true, error: null });
    try {
      const storages = await storageService.getStorages();
      set({ storages, isLoading: false });
    } catch {
      set({ isLoading: false, error: '보관함 목록을 불러오지 못했습니다.' });
    }
  },

  createStorage: async (title, description = '', isPublic = false) => {
    set({ isLoading: true, error: null });
    try {
      const created = await storageService.createStorage({
        title,
        description,
        is_public: isPublic,
      });
      set({ storages: [...get().storages, created], isLoading: false });
    } catch {
      set({ isLoading: false, error: '보관함 생성에 실패했습니다.' });
      throw new Error('create failed');
    }
  },

  updateStorage: async (id, title, description = '', isPublic = false) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await storageService.updateStorage(id, {
        title,
        description,
        is_public: isPublic,
      });
      set({
        storages: get().storages.map((s) => (s.id === id ? updated : s)),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: '보관함 수정에 실패했습니다.' });
      throw new Error('update failed');
    }
  },

  deleteStorage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await storageService.deleteStorage(id);
      set({
        storages: get().storages.filter((s) => s.id !== id),
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: '보관함 삭제에 실패했습니다.' });
      throw new Error('delete failed');
    }
  },

  clearError: () => set({ error: null }),
}));
