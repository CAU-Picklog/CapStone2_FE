/**
 * src/services/api.ts
 * Axios 인스턴스 설정 파일입니다.
 * 모든 HTTP 요청은 이 인스턴스를 통해 보냅니다.
 *
 * 백엔드 팀 연동 시 체크리스트:
 * 1. .env의 EXPO_PUBLIC_API_BASE_URL을 실제 서버 주소로 변경
 * 2. 인증 토큰이 생기면 interceptors.request에 Authorization 헤더 추가
 * 3. 에러 처리 로직은 interceptors.response에서 통합 관리
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants';
import { navigate } from '../navigation/navigationRef';

const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 모듈 수준 토큰 변수 — useAuthStore가 직접 이 파일을 import하면 순환 의존이 생기므로
// api.ts → useAuthStore → authService → api.ts 경로를 피하기 위해 setter 패턴을 사용
let _accessToken: string | null = null;

/** 로그인/로그아웃 시 useAuthStore에서 호출 */
export const setApiToken = (token: string | null) => {
  _accessToken = token;
};

// 요청 인터셉터 - 인증 토큰 자동 첨부
api.interceptors.request.use(
  (config) => {
    if (_accessToken) {
      config.headers.Authorization = `Bearer ${_accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 - 공통 에러 처리
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 → 초기화 후 로그인 화면으로 이동
      _accessToken = null;
      await AsyncStorage.removeItem('access_token');
      navigate('Login');
    }
    return Promise.reject(error);
  },
);

export default api;
