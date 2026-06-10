/**
 * Native Segmented — the real UISegmentedControl on iOS (Material recreation on Android)
 * via @react-native-segmented-control/segmented-control. Only evaluated where the native
 * path is chosen (see supportsNativeSegmented). Themed to the coach ink surface as far as
 * the control allows: dark appearance, tinted selected segment, Oswald labels.
 *
 * The control speaks indices; we map the selected index back to the option's typed value.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import { DEFAULT_SEGMENTED_THEME, SEGMENTED_FONT, type SegmentedProps } from './types';

export function NativeSegmented<T extends string>({
  options, value, onChange, accessibilityLabel, theme, style,
}: SegmentedProps<T>) {
  const t = { ...DEFAULT_SEGMENTED_THEME, ...theme };
  // Math.max keeps a sane index if `value` somehow isn't in options (renders segment 0).
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));

  return (
    <View style={style} accessibilityLabel={accessibilityLabel}>
      <SegmentedControl
        values={options.map((o) => o.label)}
        selectedIndex={selectedIndex}
        onChange={(e) => {
          const opt = options[e.nativeEvent.selectedSegmentIndex];
          if (opt) onChange(opt.value);
        }}
        appearance="dark"
        backgroundColor={t.track}
        tintColor={t.selected}
        fontStyle={{ color: t.label, fontFamily: SEGMENTED_FONT, fontSize: 14 }}
        activeFontStyle={{ color: t.selectedLabel, fontFamily: SEGMENTED_FONT, fontSize: 14 }}
        style={st.control}
      />
    </View>
  );
}

const st = StyleSheet.create({
  // Matches the JS track height (4 padding + 40 segment = 48) so swapping paths doesn't
  // reflow, and the Disponibles controls row stays level with its 48-tall filter button.
  control: { height: 48 },
});
