/**
 * src/components/ui/Tag.tsx
 * 태그 칩 컴포넌트
 *
 * 사용 예:
 *   <Tag label="아늑한 조명" />
 *   <Tag label="카페" color="#FDF0F6" />
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../../constants';

interface Props {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export default function Tag({ label, color, style }: Props) {
  return (
    <View style={[styles.tag, color ? { backgroundColor: color } : undefined, style]}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function TagList({ tags, color }: { tags: string[]; color?: string }) {
  return (
    <View style={styles.list}>
      {tags.map((tag) => (
        <Tag key={tag} label={tag} color={color} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    ...THEME.shadow.soft,
    shadowOpacity: 0.02,
    elevation: 1,
  },
  label: {
    fontSize: THEME.font.size.sm,
    fontWeight: THEME.font.weight.medium,
    color: THEME.colors.textMain,
  },
});
