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
}

// POST /storages, PUT /storages/{id} 요청
export interface StorageInput {
  title: string;
  description: string;
  is_public: boolean;
}
