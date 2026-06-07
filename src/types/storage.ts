/**
 * src/types/storage.ts
 * Storage(보관함) 관련 타입
 */

// GET /storages, POST /storages, PUT /storages/{id} 응답
export interface ApiStorage {
  id: number;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  deleted_at: string | null;
  role?: string;       // 'owner' | 'editor' | 'viewer' (서버 응답에 포함될 경우)
  owner_id?: number;   // 소유자 ID (서버 응답에 포함될 경우)
}

// POST /storages, PUT /storages/{id} 요청
export interface StorageInput {
  title: string;
  description: string;
  is_public: boolean;
}
