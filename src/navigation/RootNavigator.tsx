/**
 * src/navigation/RootNavigator.tsx
 * 앱 전체 최상위 스택 네비게이터
 *
 * 구조:
 *   비로그인 → Login / Signup
 *   로그인    → MainTabs + 모든 내부 화면
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import CrawlingPoller from '../components/common/CrawlingPoller';

import { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import { THEME } from '../constants';
import { useAuthStore } from '../store/useAuthStore';

import TabNavigator from './TabNavigator';
import PlaceDetailScreen from '../features/place/screens/PlaceDetailScreen';
import AddPlaceScreen from '../features/place/screens/AddPlaceScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import SpaceDNAQuizScreen from '../features/auth/screens/SpaceDNAQuizScreen';
import SpaceDNAResultScreen from '../features/auth/screens/SpaceDNAResultScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import InstagramImportScreen from '../features/home/screens/InstagramImportScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import RecommendationScreen from '../features/profile/screens/RecommendationScreen';
import DNAGuideScreen from '../features/profile/screens/DNAGuideScreen';
import CollaborativeScreen from '../features/social/screens/CollaborativeScreen';
import StorageInvitationsScreen from '../features/saved/screens/StorageInvitationsScreen';
import InvitationPreviewScreen from '../features/saved/screens/InvitationPreviewScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { initialize, isInitialized, user } = useAuthStore();
  const isLoggedIn = user !== null;

  useEffect(() => {
    initialize();
  }, []);

  // 딥링크 처리: picklog://invitations/{token}
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      // path: "invitations/{token}"
      const match = (parsed.path ?? '').match(/^invitations\/(.+)$/);
      if (match) {
        const token = match[1];
        // 로그인 상태가 아니면 로그인 후 처리 (현재는 로그인 화면으로만 이동)
        if (navigationRef.isReady()) {
          if (user) {
            (navigationRef as any).navigate('InvitationPreview', { token });
          } else {
            (navigationRef as any).navigate('Login');
          }
        }
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);

    // 앱이 꺼진 상태에서 링크로 진입한 경우
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => sub.remove();
  }, [user]);

  // 토큰 복원 중 — 스플래시 대기
  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.bgBot }}>
        <ActivityIndicator size="large" color={THEME.colors.textMain} />
      </View>
    );
  }

  return (
    <>
      {isLoggedIn && <CrawlingPoller />}
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: THEME.colors.surface },
          headerTintColor: THEME.colors.textMain,
          headerTitleStyle: { fontWeight: THEME.font.weight.semibold },
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: THEME.colors.bgBot },
        }}
      >
      {isLoggedIn ? (
        // ── 로그인 상태: 메인 앱 화면 ──────────────────────────────────────
        <>
          <Stack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PlaceDetail"
            component={PlaceDetailScreen}
            options={{ title: '장소 상세' }}
          />
          <Stack.Screen
            name="AddPlace"
            component={AddPlaceScreen}
            options={{ title: '새 장소 추가', presentation: 'modal' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="InstagramImport"
            component={InstagramImportScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Recommendation"
            component={RecommendationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DNAGuide"
            component={DNAGuideScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CollaborativeMap"
            component={CollaborativeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StorageInvitations"
            component={StorageInvitationsScreen}
            options={{ title: '초대 관리', headerShown: true }}
          />
          <Stack.Screen
            name="InvitationPreview"
            component={InvitationPreviewScreen}
            options={{ title: '초대', headerShown: false }}
          />
        </>
      ) : (
        // ── 비로그인 상태: 인증 화면 ────────────────────────────────────────
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SpaceDNAQuiz"
            component={SpaceDNAQuizScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SpaceDNAResult"
            component={SpaceDNAResultScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
    </>
  );
}
