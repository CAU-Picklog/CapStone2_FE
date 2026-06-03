/**
 * src/services/instagramService.ts
 *
 * POST /instagram/share          — URL + storage_id → 즉시(done) 또는 비동기(pending)
 * GET  /instagram/share-jobs/{id} — pending일 때 폴링
 * POST /instagram/save           — needs_selection 후보 선택 확정 저장
 *
 * result.status 분기
 *   "saved"           → 저장 완료 (spot 있음)
 *   "needs_selection" → 후보 장소 선택 필요 (candidates 있음)
 */

import api from './api';

// ─── 공통 타입 ───────────────────────────────────────────────────────────────

/** needs_selection 후보 장소 */
export interface ShareCandidate {
  naver_place_id: string;
  name: string;
  address?: string | null;
  road_address?: string | null;
  latitude: number;
  longitude: number;
  category_group?: string | null;
  raw_payload?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** 크롤링 결과 데이터 */
export interface CrawlData {
  url?: string | null;
  caption?: string | null;
  thumbnail_url?: string | null;
  images?: string[] | null;
  location_name?: string | null;
  [key: string]: unknown;
}

/** 저장된 Spot */
export interface ShareJobSpot {
  id: number;
  storage_id: number;
  place_id: number;
  place?: {
    id: number;
    name: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    category_group?: string | null;
  } | null;
  instagram_url?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[] | null;
  user_memo?: string | null;
  created_at: string;
}

/**
 * /instagram/share 및 share-jobs 의 result 필드
 *
 * status:
 *   "saved"           — 저장 완료, spot 포함
 *   "needs_selection" — 후보 선택 필요, candidates 포함
 */
export interface ShareJobResult {
  status: 'saved' | 'needs_selection' | string;
  spot?: ShareJobSpot | null;
  crawl_data?: CrawlData | null;
  candidates?: ShareCandidate[] | null;
  [key: string]: unknown;
}

/** POST /instagram/share 및 GET /instagram/share-jobs/{id} 공통 응답 */
export interface ShareResponse {
  status: 'pending' | 'done' | 'error' | string;
  job_id: string | null;
  result: ShareJobResult | null;
  error?: string | null;
  [key: string]: unknown;
}

/** POST /instagram/save 요청 바디 */
export interface InstagramSaveInput {
  instagram_url: string;
  caption?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[] | null;
  naver_place_id: string;
  place_name: string;
  place_address: string;
  latitude: number;
  longitude: number;
  category_group?: string | null;
  place_raw_payload?: Record<string, unknown> | null;
  storage_id: number;
  user_memo?: string;
  user_rating?: number;
}

/** POST /instagram/save 응답 */
export interface InstagramSaveResult {
  spot?: ShareJobSpot | null;
  already_saved?: boolean;
  place_created?: boolean;
  [key: string]: unknown;
}

/**
 * POST /instagram/crawl 응답
 * URL만 받아 크롤링만 수행 (저장 없음) — 미리보기용
 */
export interface CrawlResponse {
  status: 'done' | 'pending' | 'error' | string;
  job_id?: string | null;
  result?: {
    crawl_data?: CrawlData | null;
    candidates?: ShareCandidate[] | null;
  } | null;
  error?: string | null;
  [key: string]: unknown;
}

// ─── 서비스 ─────────────────────────────────────────────────────────────────

const instagramService = {
  /**
   * POST /instagram/share
   * { url, storage_id } → done(saved/needs_selection) 또는 pending
   */
  async share(url: string, storageId: number): Promise<ShareResponse> {
    const body = { url, storage_id: storageId };

    console.log('\n[instagram/share] ── 요청 ──');
    console.log('[instagram/share] body:', JSON.stringify(body));

    try {
      const res = await api.post<ShareResponse>('/instagram/share', body, {
        timeout: 60000, // Apify 시작까지 최대 60초
      });

      console.log('[instagram/share] HTTP status:', res.status);
      console.log('[instagram/share] response:', JSON.stringify(res.data));
      console.log('[instagram/share] result.status:', res.data?.result?.status);

      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[instagram/share] ── 에러 ──');
      console.error('[instagram/share] HTTP status:', err?.response?.status);
      console.error('[instagram/share] response body:', JSON.stringify(err?.response?.data));
      console.error('[instagram/share] message:', err?.message);
      throw e;
    }
  },

  /**
   * GET /instagram/share-jobs/{jobId}
   * pending 폴링용
   */
  async getJobStatus(jobId: string): Promise<ShareResponse> {
    console.log(`[instagram/share-jobs] polling job=${jobId}`);

    try {
      const res = await api.get<ShareResponse>(`/instagram/share-jobs/${jobId}`, {
        timeout: 15000,
      });

      console.log(
        `[instagram/share-jobs] status=${res.data.status}` +
        (res.data.status === 'done'
          ? ` result.status=${res.data.result?.status}`
          : '')
      );

      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(
        `[instagram/share-jobs] 에러 job=${jobId}:`,
        err?.response?.status,
        JSON.stringify(err?.response?.data),
      );
      throw e;
    }
  },

  /**
   * POST /instagram/crawl
   * URL만 받아 크롤링 + 장소 후보 추출 (저장 없음) — 미리보기용
   */
  async crawl(url: string): Promise<CrawlResponse> {
    console.log('\n[instagram/crawl] ── 요청 ──');
    console.log('[instagram/crawl] url:', url);

    try {
      const res = await api.post<CrawlResponse>('/instagram/crawl', { url }, { timeout: 60000 });
      console.log('[instagram/crawl] HTTP status:', res.status);
      console.log('[instagram/crawl] response:', JSON.stringify(res.data)?.slice(0, 300));
      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[instagram/crawl] 에러 status:', err?.response?.status);
      console.error('[instagram/crawl] data:', JSON.stringify(err?.response?.data));
      throw e;
    }
  },

  /**
   * POST /instagram/save
   * needs_selection 후보 선택 후 확정 저장
   */
  async save(input: InstagramSaveInput): Promise<InstagramSaveResult> {
    console.log('\n[instagram/save] ── 요청 ──');
    console.log('[instagram/save] body:', JSON.stringify(input));

    try {
      const res = await api.post<InstagramSaveResult>('/instagram/save', input, {
        timeout: 30000,
      });

      console.log('[instagram/save] HTTP status:', res.status);
      console.log('[instagram/save] response:', JSON.stringify(res.data));

      return res.data;
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: unknown }; message?: string };
      console.error('[instagram/save] ── 에러 ──');
      console.error('[instagram/save] HTTP status:', err?.response?.status);
      console.error('[instagram/save] response body:', JSON.stringify(err?.response?.data));
      console.error('[instagram/save] message:', err?.message);
      throw e;
    }
  },
};

export default instagramService;
