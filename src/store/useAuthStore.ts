/**
 * src/store/useAuthStore.ts
 * 인증 상태 전역 관리 (Zustand)
 */

import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginInput, SignupInput, ApiUser } from '../types';
import { SpaceDNAResult, UserSpaceDNA } from '../types/dna';
import authService from '../services/authService';
import dnaService from '../services/dnaService';
import { setApiToken } from '../services/api';

const TOKEN_KEY = 'access_token';
const DNA_KEY   = 'space_dna';

function mapApiUser(apiUser: ApiUser): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    nickname: apiUser.nickname,
    profileImageUrl: apiUser.profile_image ?? undefined,
    createdAt: apiUser.created_at,
  };
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  spaceDNA: SpaceDNAResult | null;   // 회원가입 퀴즈 결과 (공간 DNA)
  userDNA: UserSpaceDNA | null;      // 서버에서 계산된 최신 DNA
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean; // 앱 시작 시 토큰 복원 완료 여부

  isLoggedIn: boolean;

  initialize: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUserDNA: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  spaceDNA: null,
  userDNA: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  get isLoggedIn() {
    return get().user !== null;
  },

  /** 앱 시작 시 저장된 토큰 + 공간 DNA 복원 */
  initialize: async () => {
    try {
      const results = await AsyncStorage.multiGet([TOKEN_KEY, DNA_KEY]);
      const storedToken = results[0][1];
      const storedDNA: SpaceDNAResult | null = results[1][1] ? JSON.parse(results[1][1]) : null;

      if (storedToken) {
        setApiToken(storedToken);
        const apiUser = await authService.getMe();
        // 퀴즈 DNA는 AsyncStorage에만 저장 (백엔드 저장 API 없음)
        set({ user: mapApiUser(apiUser), accessToken: storedToken, spaceDNA: storedDNA });
      } else if (storedDNA) {
        set({ spaceDNA: storedDNA });
      }
    } catch {
      // 토큰이 만료됐거나 유효하지 않으면 조용히 로그아웃 처리
      await AsyncStorage.removeItem(TOKEN_KEY);
      setApiToken(null);
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const token = await authService.login(input.email, input.password);
      await AsyncStorage.setItem(TOKEN_KEY, token);
      setApiToken(token);
      const apiUser = await authService.getMe();

      // 퀴즈 DNA는 AsyncStorage에만 저장 (백엔드 저장 API 없음)
      const stored = await AsyncStorage.getItem(DNA_KEY);
      const dna: SpaceDNAResult | null = stored ? JSON.parse(stored) : null;

      set({ user: mapApiUser(apiUser), accessToken: token, spaceDNA: dna, isLoading: false });
    } catch (e: unknown) {
      const axiosError = e as {
        response?: { status?: number; data?: unknown };
        request?: unknown;
        message?: string;
        code?: string;
      };
      console.error('[login error] message:', axiosError?.message);
      console.error('[login error] code:', axiosError?.code);
      console.error('[login error] status:', axiosError?.response?.status);
      console.error('[login error] data:', JSON.stringify(axiosError?.response?.data));
      console.error('[login error] has request:', !!axiosError?.request);
      const data = axiosError?.response?.data as { detail?: string } | undefined;
      set({ isLoading: false, error: data?.detail ?? `로그인 실패 (${axiosError?.message ?? '알 수 없는 오류'})` });
    }
  },

  /** 회원가입 후 자동 로그인 */
  signup: async (input) => {
    set({ isLoading: true, error: null });

    // 1단계: 회원가입
    try {
      await authService.signup(input);
    } catch (e: unknown) {
      const axiosError = e as { response?: { status?: number; data?: { detail?: unknown } } };
      const raw = axiosError?.response?.data?.detail;
      console.error('[signup error]', axiosError?.response?.status, raw);
      // FastAPI 422: detail이 배열일 수 있음
      let msg = '회원가입에 실패했습니다.';
      if (typeof raw === 'string') {
        msg = raw;
      } else if (Array.isArray(raw) && raw.length > 0) {
        const first = raw[0] as { msg?: string };
        msg = first?.msg ?? msg;
      }
      set({ isLoading: false, error: msg });
      return;
    }

    // 2단계: 자동 로그인
    try {
      const token = await authService.login(input.email, input.password);
      // getMe()가 Authorization 헤더를 쓰므로 먼저 토큰을 등록
      setApiToken(token);
      const apiUser = await authService.getMe();

      const dna = input.spaceDNA ?? null;
      const storageItems: [string, string][] = [[TOKEN_KEY, token]];
      if (dna) storageItems.push([DNA_KEY, JSON.stringify(dna)]);
      await AsyncStorage.multiSet(storageItems);

      // 퀴즈 DNA 서버 저장 (POST /users/me/space-dna)
      if (dna) {
        try {
          await authService.createSpaceDNA(dna);
        } catch (dnaErr: unknown) {
          const e = dnaErr as { response?: { status?: number } };
          console.error('[signup] createSpaceDNA 실패 status:', e?.response?.status);
        }
      }

      set({ user: mapApiUser(apiUser), accessToken: token, spaceDNA: dna, isLoading: false });
    } catch (e: unknown) {
      const fetchError = e as { response?: { status?: number; data?: { detail?: string } } };
      console.error('[auto-login error]', fetchError?.response?.status, fetchError?.response?.data);
      // 회원가입은 성공했으니 로그인 화면으로 유도
      set({ isLoading: false, error: '계정이 생성됐어요. 로그인 화면에서 로그인해주세요.' });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, DNA_KEY]);
      setApiToken(null);
    } finally {
      set({ user: null, accessToken: null, spaceDNA: null, userDNA: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  /** 방문 완료 후 최신 사용자 DNA를 서버에서 재조회해 store에 반영 */
  refreshUserDNA: async () => {
    const { user } = get();
    if (!user) return;
    // null = has_data:false or 오류 → userDNA를 null로 세팅해 퀴즈 DNA가 보이게 함
    const dna = await dnaService.getUserDNA(user.id);
    set({ userDNA: dna });
  },
}));
