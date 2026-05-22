/**
 * src/hooks/usePlaceSpaceDNA.ts
 * 장소별 공간 DNA를 가져오는 커스텀 훅.
 *
 * - placeId가 null이면 호출하지 않음
 * - API 실패 시 dna === null, hasError === true 로 처리
 *   (place 화면 전체가 깨지지 않도록 에러를 격리)
 * - 재사용 가능한 장소: PlaceDetail / SavedListScreen / MapScreen 핀 상세 등
 */

import { useState, useEffect } from 'react';
import { PlaceSpaceDNA } from '../types/dna';
import dnaService from '../services/dnaService';

interface UsePlaceSpaceDNAResult {
  dna: PlaceSpaceDNA | null;
  isLoading: boolean;
  hasError: boolean;
}

export function usePlaceSpaceDNA(placeId: number | null): UsePlaceSpaceDNAResult {
  const [dna, setDna] = useState<PlaceSpaceDNA | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (placeId === null) return;

    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    setDna(null);

    dnaService.getPlaceSpaceDNA(placeId).then((data) => {
      if (cancelled) return;
      if (data === null) {
        setHasError(true);
      } else {
        setDna(data);
      }
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, [placeId]);

  return { dna, isLoading, hasError };
}
