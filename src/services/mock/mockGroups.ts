/**
 * src/services/mock/mockGroups.ts
 * 소셜 협업(Collaborative Mapping) 그룹 mock 데이터
 *
 * 실제 API: GET /api/groups  (백엔드 팀)
 * 백엔드 연동 후 이 파일은 삭제하고 API 호출로 교체하세요.
 */

// ─── 타입 정의 ─────────────────────────────────────────────

export interface GroupMember {
  id: string;
  nickname: string;
  profileInitial: string; // 아바타 폴백용 이니셜
}

export interface GroupDNAScore {
  density: { D: number; S: number };   // D + S = 100
  stimulus: { H: number; M: number };  // H + M = 100
  temporal: { F: number; V: number };  // F + V = 100
}

export interface GroupDNA {
  code: string;         // 예: "D-M-F"
  title: string;        // 공간 취향 제목
  description: string;  // 그룹 취향 설명
  score: GroupDNAScore;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  coverEmoji: string;
  members: GroupMember[];
  placeIds: string[];  // 그룹이 공동으로 저장한 장소 ID
  dna: GroupDNA;
  createdAt: string;
}

// ─── Mock 데이터 ──────────────────────────────────────────

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: '지민과의 공간',
    description: '지민이랑 함께 기록하는 서울 카페 모음',
    coverEmoji: '☕',
    members: [
      { id: 'me', nickname: '성시훈', profileInitial: '성' },
      { id: 'u2', nickname: '지민', profileInitial: '지' },
    ],
    placeIds: ['1', '5', 'ig_1'],
    dna: {
      code: 'D-M-F',
      title: '활기찬 도시 탐험가',
      description: '트렌디하고 활기찬 공간을 함께 즐기는 그룹이에요.',
      score: {
        density: { D: 65, S: 35 },
        stimulus: { H: 32, M: 68 },
        temporal: { F: 74, V: 26 },
      },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    id: 'g2',
    name: '수현·태양과의 공간',
    description: '셋이서 발굴한 서울 숨은 명소들',
    coverEmoji: '🗺️',
    members: [
      { id: 'me', nickname: '성시훈', profileInitial: '성' },
      { id: 'u3', nickname: '수현', profileInitial: '수' },
      { id: 'u4', nickname: '태양', profileInitial: '태' },
    ],
    placeIds: ['2', '3', '6', 'ig_2'],
    dna: {
      code: 'S-M-V',
      title: '고요한 역사 산책자',
      description: '조용하고 전통적인 공간을 함께 탐방하는 그룹이에요.',
      score: {
        density: { D: 25, S: 75 },
        stimulus: { H: 18, M: 82 },
        temporal: { F: 28, V: 72 },
      },
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];
