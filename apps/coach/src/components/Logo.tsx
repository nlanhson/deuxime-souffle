/**
 * Logo — the Deuxième Souffle brand mark (the white "raised hand" on the red→orange gradient).
 *
 * Single source for the app logo so the splash, the welcome lockup, and the login header all render
 * the same asset at different sizes. Sources the app icon (assets/icon.png), clipped to the design
 * system's radius so it reads as a rounded brand badge on the ink canvas. Decorative by default — it
 * sits next to the wordmark/title that already carry the brand name for screen readers; the glow is
 * the same rouge halo used on the primary CTA and the profile avatar.
 */
import React from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radius as r } from '../theme/theme';

const SRC = require('../../assets/icon.png');

export function Logo({
  size = 44,
  rounded = r.lg,
  glow = false,
  style,
}: {
  size?: number;
  rounded?: number;
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[glow && st.glow, style]}>
      <Image
        source={SRC}
        style={{ width: size, height: size, borderRadius: rounded }}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const st = StyleSheet.create({
  glow: {
    shadowColor: palette.rouge[500],
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
  },
});
