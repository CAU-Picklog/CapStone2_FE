/**
 * src/navigation/navigationRef.ts
 * NavigationContainer 외부 (AppDrawer 등)에서 navigate()를 호출하기 위한 ref
 *
 * 사용 예:
 *   navigate('Settings')  — NavigationContainer 밖에서도 동작
 */

import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}
