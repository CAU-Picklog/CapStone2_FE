/**
 * src/types/dna.ts
 * 공간 DNA 타입 정의
 *
 * 공간 DNA는 3개의 핵심 축을 기반으로 공간 특성을 분류합니다:
 * - Density  : D (Dense - 붐빔, 활기) vs S (Sparse - 여유, 조용)  → API 키: density
 * - Stimulus : H (High - 자극 강함)  vs M (Mild - 자극 약함, 차분함) → API 키: color
 * - Temporal : F (Fresh - 현대적)    vs V (Vintage - 전통적, 오래됨) → API 키: form
 */

// ─── 기본 축 타입 ───────────────────────────────────────────────────────────

export type DensityAxis  = 'D' | 'S';
export type StimulusAxis = 'H' | 'M';
export type TemporalAxis = 'F' | 'V';

/** DNA 코드 문자열. 예: "DHF", "SMV" */
export type DNACode = string;

/** 각 축별 비율 점수 (퍼센트, 합: D+S=100, H+M=100, F+V=100) */
export interface DNAAxisScore {
  D: number;
  S: number;
  H: number;
  M: number;
  F: number;
  V: number;
}

// ─── 유저 DNA ───────────────────────────────────────────────────────────────

/** 유저의 공간 DNA 프로필 */
export interface UserSpaceDNA {
  userId: string;
  code: DNACode;
  score: DNAAxisScore;
  placeCount: number;
  updatedAt: string; // ISO 8601
}

/** DNA 기반 추천 필터 */
export interface DNAFilter {
  density?: DensityAxis;
  stimulus?: StimulusAxis;
  temporal?: TemporalAxis;
}

/** 퀴즈 결과로 계산된 공간 DNA (API 전송 포맷과 동일) */
export interface SpaceDNAResult {
  density: { dense: number; sparse: number };
  stimulus: { high: number; mild: number };
  temporal: { fresh: number; vintage: number };
  type: string; // 예: "DHV"
}

// ─── 장소 공간 DNA (GET /places/{id}/space-dna 응답) ────────────────────────

/**
 * 백엔드 API가 반환하는 mbti_axes 원시 점수.
 * 각 값은 0~100 범위의 float.
 * - density : 밀도 (>50 → D Dense, ≤50 → S Sparse)
 * - color   : 자극 강도 (>50 → H High, ≤50 → M Mild)
 * - form    : 시간성 (>50 → F Fresh, ≤50 → V Vintage)
 */
export interface PlaceSpaceDNAAxes {
  density: number;
  color: number;
  form: number;
}

/** GET /places/{place_id}/space-dna 응답 전체 */
export interface PlaceSpaceDNA {
  has_data: boolean;
  mbti_axes: PlaceSpaceDNAAxes;
  ai_summary: string;
  updated_at: string;
}

/**
 * mbti_axes 점수로부터 DNA 코드 문자열을 계산.
 * 예: { density: 70, color: 30, form: 60 } → "DHF" (아니라 "DMF")
 * 각 축 50 초과 → 양성(D/H/F), 이하 → 음성(S/M/V)
 */
export function derivePlaceDNACode(axes: PlaceSpaceDNAAxes): DNACode {
  const d = axes.density > 50 ? 'D' : 'S';
  const h = axes.color   > 50 ? 'H' : 'M';
  const f = axes.form    > 50 ? 'F' : 'V';
  return `${d}${h}${f}`;
}
