/**
 * src/components/common/CustomTabBar.tsx
 * Variant 디자인 기반 플로팅 pill 바텀 네비게이션
 *
 * TabNavigator의 tabBar prop에 전달하는 커스텀 컴포넌트입니다.
 * - 하단에서 32px 떠 있는 pill 모양
 * - 활성 탭: 아이콘 채워짐 + 라벨 표시
 * - 비활성 탭: 아이콘 외곽선만 + 라벨 숨김
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THEME } from '../../constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<string, { active: IoniconsName; inactive: IoniconsName; label: string }> = {
  Home:  { active: 'home',          inactive: 'home-outline',          label: '홈'   },
  Map:   { active: 'location',      inactive: 'location-outline',      label: '지도' },
  Saved: { active: 'bookmark',      inactive: 'bookmark-outline',      label: '저장' },
  Feed:  { active: 'chatbubble',    inactive: 'chatbubble-outline',    label: '피드' },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { bottom: Math.max(insets.bottom, 16) + 16 }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const config = TAB_CONFIG[route.name] ?? {
            active: 'ellipse',
            inactive: 'ellipse-outline',
            label: route.name,
          };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.item}
              onPress={onPress}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key].options.tabBarAccessibilityLabel}
            >
              <Ionicons
                name={isFocused ? config.active : config.inactive}
                size={24}
                color={isFocused ? THEME.colors.textMain : THEME.colors.textMuted}
              />
              {isFocused && (
                <Text style={styles.label}>{config.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    alignItems: 'center',
    zIndex: 100,
    // Android elevation
    ...Platform.select({
      android: { elevation: 8 },
    }),
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderRadius: THEME.radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 382,
    ...THEME.shadow.float,
  },
  item: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    fontWeight: THEME.font.weight.semibold,
    color: THEME.colors.textMain,
    marginTop: 2,
  },
});
