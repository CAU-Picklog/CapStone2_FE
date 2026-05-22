/**
 * src/services/mock/mockPlaceDNA.ts
 * 장소별 공간 DNA mock 데이터

 */

import { DensityAxis, StimulusAxis, TemporalAxis } from '../../types/dna';

// ─── 퍼센트 점수 타입 ─────────────────────────────────────

export interface PlaceDNAScore {
  density: { D: number; S: number };   // D + S = 100
  stimulus: { H: number; M: number };  // H + M = 100
  temporal: { F: number; V: number };  // F + V = 100
}

export interface PlaceDNA {
  code: string;           // 예: "S-M-V"
  density: DensityAxis;
  stimulus: StimulusAxis;
  temporal: TemporalAxis;
  score: PlaceDNAScore;   // 각 축 퍼센트 (시각화용)
}

/** 장소 ID → DNA 매핑 */
export const MOCK_PLACE_DNA: Record<string, PlaceDNA> = {
  // mockPlaces.ts 장소들
  '1': {
    code: 'S-M-V', density: 'S', stimulus: 'M', temporal: 'V',
    score: { density: { D: 28, S: 72 }, stimulus: { H: 22, M: 78 }, temporal: { F: 18, V: 82 } },
  }, // 경복궁
  '2': {
    code: 'S-M-V', density: 'S', stimulus: 'M', temporal: 'V',
    score: { density: { D: 35, S: 65 }, stimulus: { H: 30, M: 70 }, temporal: { F: 25, V: 75 } },
  }, // 인사동
  '3': {
    code: 'S-M-V', density: 'S', stimulus: 'M', temporal: 'V',
    score: { density: { D: 20, S: 80 }, stimulus: { H: 15, M: 85 }, temporal: { F: 12, V: 88 } },
  }, // 북촌한옥마을
  '4': {
    code: 'S-M-F', density: 'S', stimulus: 'M', temporal: 'F',
    score: { density: { D: 38, S: 62 }, stimulus: { H: 40, M: 60 }, temporal: { F: 68, V: 32 } },
  }, // 남산서울타워
  '5': {
    code: 'D-M-F', density: 'D', stimulus: 'M', temporal: 'F',
    score: { density: { D: 70, S: 30 }, stimulus: { H: 35, M: 65 }, temporal: { F: 78, V: 22 } },
  }, // 홍대 피크닉 카페
  '6': {
    code: 'S-M-V', density: 'S', stimulus: 'M', temporal: 'V',
    score: { density: { D: 30, S: 70 }, stimulus: { H: 25, M: 75 }, temporal: { F: 20, V: 80 } },
  }, // 광화문광장

  // mockInstagram.ts 장소들
  ig_1: {
    code: 'D-M-F', density: 'D', stimulus: 'M', temporal: 'F',
    score: { density: { D: 65, S: 35 }, stimulus: { H: 38, M: 62 }, temporal: { F: 72, V: 28 } },
  }, // 성수동 카페 어니언
  ig_2: {
    code: 'S-M-F', density: 'S', stimulus: 'M', temporal: 'F',
    score: { density: { D: 22, S: 78 }, stimulus: { H: 20, M: 80 }, temporal: { F: 60, V: 40 } },
  }, // 서울식물원
  ig_3: {
    code: 'D-H-V', density: 'D', stimulus: 'H', temporal: 'V',
    score: { density: { D: 75, S: 25 }, stimulus: { H: 68, M: 32 }, temporal: { F: 30, V: 70 } },
  }, // 을지로 빈티지 바
};

/** DNA 축 레이블 (화면 표시용) */
export const DNA_AXIS_LABELS = {
  density: {
    D: { key: 'D', name: '붐빔', desc: '활기차고 사람이 많은 공간' },
    S: { key: 'S', name: '여유', desc: '조용하고 한적한 공간' },
  },
  stimulus: {
    H: { key: 'H', name: '자극 강함', desc: '화려하고 감각적인 공간' },
    M: { key: 'M', name: '차분함', desc: '잔잔하고 편안한 공간' },
  },
  temporal: {
    F: { key: 'F', name: '현대적', desc: '트렌디하고 신선한 공간' },
    V: { key: 'V', name: '전통적', desc: '오랜 역사와 감성의 공간' },
  },
} as const;
