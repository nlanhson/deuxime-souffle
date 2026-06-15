/**
 * Native Segmented — the real UISegmentedControl on iOS (Material recreation on Android) via
 * @react-native-segmented-control/segmented-control. Only evaluated where the native path is chosen
 * (see supportsNativeSegmented). Themed to the coach ink surface: dark appearance, tinted selected
 * segment, Inter labels.
 *
 * iOS 26 (Liquid Glass) gets special handling: we leave the track as pure system glass (a custom
 * backgroundColor only paints a layer *behind* the glass capsule — the visible "layer under the
 * toggle" artifact) and hand label contrast to the system. We still tint the selected capsule
 * (theme.selected → neutral[700]) so it's a subdued on-palette pill, not the over-bright default
 * glass. Pre-26 iOS and Android aren't glass, so they keep the fully branded track + labels.
 *
 * The control speaks indices; we map the selected index back to the option's typed value.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

import { DEFAULT_SEGMENTED_THEME, SEGMENTED_FONT, type SegmentedProps } from './types';
import { isLiquidGlassIOS } from './supportsNativeSegmented';

export function NativeSegmented<T extends string>({
  options, value, onChange, accessibilityLabel, theme, style,
}: SegmentedProps<T>) {
  const t = { ...DEFAULT_SEGMENTED_THEME, ...theme };
  // Math.max keeps a sane index if `value` somehow isn't in options (renders segment 0).
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const glass = isLiquidGlassIOS();

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
        backgroundColor={glass ? undefined : t.track}
        tintColor={t.selected}
        fontStyle={{ fontFamily: SEGMENTED_FONT, fontSize: 14, ...(glass ? null : { color: t.label }) }}
        activeFontStyle={{ fontFamily: SEGMENTED_FONT, fontSize: 14, ...(glass ? null : { color: t.selectedLabel }) }}
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
