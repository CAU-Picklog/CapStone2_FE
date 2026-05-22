/**
 * App.tsx
 * 앱 진입점
 *
 * - NavigationContainer ref: AppDrawer 등 외부에서 navigate() 사용 가능
 * - AppDrawer: NavigationContainer 안에 위치해야 useNavigation 사용 가능
 */
import 'react-native-gesture-handler';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import RootNavigator from './src/navigation/RootNavigator';
import AppDrawer from './src/components/common/AppDrawer';
import { navigationRef } from './src/navigation/navigationRef';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="dark" />
        <RootNavigator />
        {/* Drawer는 NavigationContainer 안에서 navigate() 사용 */}
        <AppDrawer />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
