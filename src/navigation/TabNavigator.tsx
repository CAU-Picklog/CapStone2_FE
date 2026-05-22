/**
 * src/navigation/TabNavigator.tsx
 * Variant 디자인 기반 플로팅 pill 바텀 탭 네비게이터
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabParamList } from './types';
import CustomTabBar from '../components/common/CustomTabBar';

import HomeScreen from '../features/home/screens/HomeScreen';
import MapScreen from '../features/map/screens/MapScreen';
import SavedListScreen from '../features/saved/screens/SavedListScreen';
import FeedScreen from '../features/feed/screens/FeedScreen';

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Saved" component={SavedListScreen} />
      <Tab.Screen name="Feed" component={FeedScreen} />
    </Tab.Navigator>
  );
}
