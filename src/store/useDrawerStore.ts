/**
 * src/store/useDrawerStore.ts
 * 왼쪽 Drawer 열림/닫힘 상태 전역 관리
 */

import create from 'zustand';

interface DrawerState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));
