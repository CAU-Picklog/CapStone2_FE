/**
 * src/components/common/LoadingSpinner.tsx
 * 로딩 중일 때 표시하는 공통 스피너 컴포넌트
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  color?: string;
  size?: 'small' | 'large';
}

export default function LoadingSpinner({
  color = COLORS.primary,
  size = 'large',
}: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
