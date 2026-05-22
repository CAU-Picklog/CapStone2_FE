# 팀원 온보딩 가이드

---

## 처음 시작할 때

```bash
# 1. 프로젝트 클론
git clone [저장소 주소]
cd 캡스톤2

# 2. 패키지 설치
npm install --legacy-peer-deps

# 3. 환경변수 설정
cp .env.example .env
# .env 파일 열어서 값 채우기 

# 4. 실행
npx expo start
```

---

## 폴더 구조 이해

```
src/
├── types/          ← 데이터 타입 정의 (여기 먼저 보기)
├── services/       ← API 호출 함수 (백엔드 팀이 주로 수정)
│   ├── api.ts              ← axios 설정
│   ├── placeService.ts     ← 장소 CRUD
│   ├── authService.ts      ← 로그인/회원가입
│   └── aiService.ts        ← AI 기능 (AI 팀이 채울 파일)
├── store/          ← 전역 상태 (화면 간 공유 데이터)
├── features/       ← 화면별 코드 (각자 담당 화면 폴더 작업)
└── components/     ← 여러 화면에서 공통으로 쓰는 컴포넌트
```

---

## 역할별 작업 위치

### 백엔드 팀원이 API 연결할 때

1. `.env` 파일에서 서버 주소 변경
```
EXPO_PUBLIC_API_BASE_URL=http://실제서버주소:포트
```

2. 각 서비스 파일에서 `TODO` 찾아서 교체
```typescript
// placeService.ts - 이 부분을 교체
// TODO: return (await api.get('/api/places')).data;
return MOCK_PLACES; // ← 이 줄 지우고 위 줄 주석 해제
```

3. 인증 토큰이 생기면 `api.ts` 인터셉터에 추가
```typescript
// api.ts - 이 부분 채우기
api.interceptors.request.use((config) => {
  const token = '토큰가져오는코드';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```


---

### 새 화면 추가할 때

1. `src/features/` 안에 담당 기능 폴더 만들기
```
src/features/
└── 내기능/
    ├── screens/
    │   └── 내화면Screen.tsx
    └── components/     ← 이 화면에서만 쓰는 컴포넌트
        └── 내컴포넌트.tsx
```

2. `src/navigation/types.ts` 에 화면 이름 추가
```typescript
export type RootStackParamList = {
  // 기존 화면들...
  내화면: { 파라미터?: string }; // ← 추가
};
```

3. `src/navigation/RootNavigator.tsx` 에 화면 등록
```typescript
<Stack.Screen name="내화면" component={내화면Screen} />
```

---

### 새 데이터 타입 추가할 때

`src/types/` 폴더에 파일 추가 후 `src/types/index.ts` 에 export 추가
```typescript
// index.ts
export * from './내타입파일';
```

---

## 코드 작성 규칙

- **API 호출은 반드시 `services/` 폴더 안에서만** - 화면 컴포넌트에서 직접 axios 쓰지 말 것
- **전역 상태는 `store/` 폴더** - 한 화면에서만 쓰는 데이터는 `useState` 사용
- **타입은 `any` 쓰지 말 것** - 모르면 팀장한테 물어보기
- **Mock 데이터 위치** - `src/services/mock/mockPlaces.ts` (백엔드 연결 후 삭제)

---

## 자주 쓰는 명령어

```bash
npx expo start           # 개발 서버 시작
npx expo start --clear   # 캐시 지우고 시작 (오류날 때)
npm install 패키지명 --legacy-peer-deps  # 패키지 추가할 때
```

---

## 막힐 때

1. 캐시 문제 → `npx expo start --clear`
2. 패키지 오류 → `npm install --legacy-peer-deps`
3. 타입 오류 → VSCode에서 `Ctrl+Shift+P` → TypeScript: Restart TS Server
