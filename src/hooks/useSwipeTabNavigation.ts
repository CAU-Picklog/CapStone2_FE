/**
 * src/hooks/useSwipeTabNavigation.ts
 * 좌우 스와이프로 탭 전환 + 자연스러운 슬라이드 애니메이션
 *
 * 반환값:
 *  - panHandlers: View의 {...panHandlers} 에 전달
 *  - animatedStyle: Animated.View의 style에 추가 ({ transform: [{ translateX }] })
 *
 * 동작:
 *  - 왼쪽 스와이프  → 다음 탭으로 슬라이드 전환
 *  - 오른쪽 스와이프 (enableDrawer=true, Home) → Drawer 열기
 *  - 오른쪽 스와이프 (다른 탭) → 이전 탭으로 슬라이드 전환
 *  - 임계값 미달 → spring으로 원위치
 *
 * 옵션:
 *  - enableDrawer: 오른쪽 스와이프 시 Drawer 열기 (Home 전용, default false)
 */

import { useRef } from 'react';
import { Animated, Dimensions, PanResponder } from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../navigation/types';
import { useDrawerStore } from '../store/useDrawerStore';

const TAB_ORDER: (keyof TabParamList)[] = ['Home', 'Map', 'Saved', 'Feed'];
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 스와이프 인식 최소 이동 거리
const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

// 스와이프 중 화면이 따라오는 비율 (0~1)
const DRAG_RATIO = 0.5;

// 전환 후 밀림 애니메이션 이동량 (화면 너비의 %)
const SLIDE_OUT_DISTANCE = SCREEN_WIDTH * 0.18;

interface Options {
  enableDrawer?: boolean;
}

export function useSwipeTabNavigation({ enableDrawer = false }: Options = {}) {
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const currentIndex = useNavigationState((state) => state.index);
  const openDrawer = useDrawerStore((state) => state.open);

  const translateX = useRef(new Animated.Value(0)).current;

  // Ref로 최신값 유지 (PanResponder 클로저 문제 방지)
  const currentIndexRef = useRef(currentIndex);
  currentIndexRef.current = currentIndex;

  const openDrawerRef = useRef(openDrawer);
  openDrawerRef.current = openDrawer;

  const navRef = useRef(navigation);
  navRef.current = navigation;

  const panResponder = useRef(
    PanResponder.create({
      // 터치 시작 시점에는 응답하지 않음 (ScrollView 우선)
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // 이동 중에 수평 제스처인지 판단
      onMoveShouldSetPanResponder: (_, gs) => {
        const { dx, dy } = gs;
        // 수평 이동이 수직의 2배 이상 + 최소 30px 이상이어야 탭 전환 의도로 판단
        // (30px threshold: 가로 ScrollView 내부 짧은 드래그와 구분)
        return Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 2;
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderGrant: () => {
        translateX.setValue(0);
      },

      onPanResponderMove: (_, gs) => {
        const { dx } = gs;
        const idx = currentIndexRef.current;

        const canGoNext = idx < TAB_ORDER.length - 1;
        const canGoPrev = idx > 0;
        const isDrawerSwipe = enableDrawer && idx === 0 && dx > 0;

        if (dx < 0 && canGoNext) {
          // 왼쪽: 다음 탭 방향으로 따라옴
          translateX.setValue(dx * DRAG_RATIO);
        } else if (dx > 0 && canGoPrev) {
          // 오른쪽: 이전 탭 방향으로 따라옴
          translateX.setValue(dx * DRAG_RATIO);
        } else if (isDrawerSwipe) {
          // Drawer 방향: 화면 자체는 이동하지 않음
          translateX.setValue(0);
        } else {
          // 갈 곳 없음: 약한 rubber-band
          translateX.setValue(dx * 0.08);
        }
      },

      onPanResponderRelease: (_, gs) => {
        const { dx, vx } = gs;
        const idx = currentIndexRef.current;
        const nav = navRef.current;

        const isSwipeLeft = dx < -SWIPE_THRESHOLD || (dx < -20 && vx < -VELOCITY_THRESHOLD);
        const isSwipeRight = dx > SWIPE_THRESHOLD || (dx > 20 && vx > VELOCITY_THRESHOLD);

        if (isSwipeLeft && idx < TAB_ORDER.length - 1) {
          // 다음 탭으로 전환: 살짝 밀고 navigate
          Animated.timing(translateX, {
            toValue: -SLIDE_OUT_DISTANCE,
            duration: 150,
            useNativeDriver: true,
          }).start(() => {
            translateX.setValue(0);
            nav.navigate(TAB_ORDER[idx + 1]);
          });
        } else if (isSwipeRight) {
          if (enableDrawer && idx === 0) {
            // Home에서 오른쪽 → Drawer 열기 (화면 이동 없음)
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }).start();
            openDrawerRef.current();
          } else if (idx > 0) {
            // 이전 탭으로 전환
            Animated.timing(translateX, {
              toValue: SLIDE_OUT_DISTANCE,
              duration: 150,
              useNativeDriver: true,
            }).start(() => {
              translateX.setValue(0);
              nav.navigate(TAB_ORDER[idx - 1]);
            });
          } else {
            springBack();
          }
        } else {
          // 임계값 미달 → 원위치 spring
          springBack();
        }
      },

      onPanResponderTerminate: () => {
        springBack();
      },
    })
  ).current;

  function springBack() {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }

  const animatedStyle = {
    transform: [{ translateX }],
  };

  return { panHandlers: panResponder.panHandlers, animatedStyle };
}
