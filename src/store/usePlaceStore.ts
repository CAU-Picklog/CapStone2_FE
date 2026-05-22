/**
 * src/store/usePlaceStore.ts
 * Zustand 기반 전역 상태 관리 스토어입니다.
 *
 * 왜 Zustand?
 * - Context보다 리렌더링 최적화가 쉽습니다
 * - Redux보다 코드가 훨씬 간결합니다
 * - persist 미들웨어로 나중에 로컬 저장도 쉽게 추가 가능합니다
 *
 * 사용 예시 (스크린에서):
 *   const { places, fetchPlaces } = usePlaceStore();
 *   useEffect(() => { fetchPlaces(); }, []);
 */

import create from 'zustand';
import { Place } from '../types';
import placeService from '../services/placeService';

interface PlaceState {
  // ─── 상태 ───────────────────────────────────────
  places: Place[];
  savedPlaceIds: string[]; // 유저가 저장한 장소 ID 목록
  isLoading: boolean;
  error: string | null;

  // ─── 액션 ───────────────────────────────────────
  /** 전체 장소 목록을 서버에서 불러옵니다 */
  fetchPlaces: () => Promise<void>;

  /** 장소를 내 컬렉션에 저장합니다 */
  savePlace: (placeId: string) => Promise<void>;

  /** 장소 저장을 취소합니다 */
  unsavePlace: (placeId: string) => Promise<void>;

  /** 특정 장소가 저장되어 있는지 확인합니다 */
  isSaved: (placeId: string) => boolean;

  /** ID로 장소를 찾습니다 */
  getPlaceById: (placeId: string) => Place | undefined;

  /** 에러 초기화 */
  clearError: () => void;
}

export const usePlaceStore = create<PlaceState>((set, get) => ({
  // ─── 초기 상태 ──────────────────────────────────
  places: [],
  savedPlaceIds: [],
  isLoading: false,
  error: null,

  // ─── 액션 구현 ──────────────────────────────────
  fetchPlaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const places = await placeService.getPlaces();
      set({ places, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : '장소를 불러오지 못했습니다.';
      set({ isLoading: false, error: message });
    }
  },

  savePlace: async (placeId: string) => {
    try {
      await placeService.savePlace(placeId);
      set((state) => ({
        savedPlaceIds: [...state.savedPlaceIds, placeId],
        // saveCount 즉시 반영 (낙관적 업데이트)
        places: state.places.map((p) =>
          p.id === placeId ? { ...p, saveCount: p.saveCount + 1 } : p,
        ),
      }));
    } catch {
      console.error('[Store] 장소 저장 실패:', placeId);
    }
  },

  unsavePlace: async (placeId: string) => {
    try {
      await placeService.unsavePlace(placeId);
      set((state) => ({
        savedPlaceIds: state.savedPlaceIds.filter((id) => id !== placeId),
        places: state.places.map((p) =>
          p.id === placeId ? { ...p, saveCount: Math.max(0, p.saveCount - 1) } : p,
        ),
      }));
    } catch {
      console.error('[Store] 장소 저장 취소 실패:', placeId);
    }
  },

  isSaved: (placeId: string) => {
    return get().savedPlaceIds.includes(placeId);
  },

  getPlaceById: (placeId: string) => {
    return get().places.find((p) => p.id === placeId);
  },

  clearError: () => set({ error: null }),
}));
