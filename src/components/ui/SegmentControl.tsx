/**
 * src/components/ui/SegmentControl.tsx
 * iOS 스타일 세그먼트 컨트롤 (나의 지도 / 모두의 지도)
 *
 * 사용 예:
 *   <SegmentControl
 *     options={['나의 지도', '모두의 지도']}
 *     selected={0}
 *     onChange={(index) => setTab(index)}
 *   />
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../../constants';

interface Props {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
}

export default function SegmentControl({ options, selected, onChange }: Props) {
  return (
    <View style={styles.container}>
      {options.map((label, index) => (
        <TouchableOpacity
          key={label}
          style={[styles.btn, selected === index && styles.btnActive]}
          onPress={() => onChange(index)}
          activeOpacity={0.8}
        >
          <Text style={[styles.label, selected === index && styles.labelActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: THEME.radius.pill,
    padding: 6,
    alignSelf: 'center',
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: THEME.radius.pill,
  },
  btnActive: {
    backgroundColor: THEME.colors.surface,
    ...THEME.shadow.soft,
    shadowOpacity: 0.05,
    elevation: 2,
  },
  label: {
    fontSize: THEME.font.size.md,
    fontWeight: THEME.font.weight.semibold,
    color: THEME.colors.textMuted,
  },
  labelActive: {
    color: THEME.colors.textMain,
  },
});
