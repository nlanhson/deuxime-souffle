/**
 * AnimatedMeterFill — a progress meter whose fill sweeps from empty to its value on first load, then
 * sits still. The signature rouge→or "movement" gradient (the gesture reserved for medals/progress).
 *
 * Why the flex trick: RN's native driver can't animate `width`, and animating width off the native
 * driver janks. Instead the track is a row of two views — an inner fill (flex 0→frac) wrapping the
 * gradient, and a spacer (flex 1→1-frac) — and we animate `flex` on a JS-driven Animated.Value. The
 * gradient itself never resizes awkwardly; it's simply revealed. Keep this JS-driven flex on its own
 * view, never on the same view as a native-driven opacity/transform (RN forbids mixing drivers).
 *
 * Motion safety: when `animate` is false (Reduce Motion, or a revisit that shouldn't replay) the
 * meter renders at its FINAL fill on mount — no sweep. The accessibility value always reports the
 * final {min,max,now} from first render, so a screen reader never sees a mid-animation number; the
 * sweep is purely decorative and the bare track is hidden from assistive tech.
 */
import React from 'react';
import { Animated, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette } from '../theme/theme';
import { ease, dur } from '../lib/motion';

const MOVEMENT = [palette.rouge[500], palette.or[500]] as const;

export function AnimatedMeterFill({
  frac,
  play,
  animate,
  colors = MOVEMENT,
  height = 8,
  trackColor = palette.neutral[200],
  duration = dur.slow,
  delay = 0,
  a11yValue,
  style,
}: {
  /** 0–1 target fill. */
  frac: number;
  /** Choreography "go" signal — starts the sweep once. */
  play: boolean;
  /** Whether this instance animates at all (false → render final, e.g. Reduce Motion / revisit). */
  animate: boolean;
  colors?: readonly [string, string];
  height?: number;
  trackColor?: string;
  duration?: number;
  delay?: number;
  /** Final values for the progressbar role — reported from first render regardless of the sweep. */
  a11yValue?: { min: number; max: number; now: number };
  style?: StyleProp<ViewStyle>;
}) {
  const f = Math.max(0, Math.min(1, frac));
  const t = React.useRef(new Animated.Value(animate ? 0 : 1)).current;
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!animate || started.current || !play) return;
    started.current = true;
    Animated.timing(t, { toValue: 1, duration, delay, easing: ease.out, useNativeDriver: false }).start();
  }, [play, animate, duration, delay, t]);

  // Honour a mid-load Reduce Motion toggle: snap to the final fill rather than leaving it empty.
  React.useEffect(() => { if (!animate) t.setValue(1); }, [animate, t]);

  const innerFlex = t.interpolate({ inputRange: [0, 1], outputRange: [0, f] });
  const spacerFlex = t.interpolate({ inputRange: [0, 1], outputRange: [1, 1 - f] });

  return (
    <View
      style={[{ height, backgroundColor: trackColor, borderRadius: 999, overflow: 'hidden', flexDirection: 'row' }, style]}
      accessibilityRole={a11yValue ? 'progressbar' : undefined}
      accessibilityValue={a11yValue}
    >
      <Animated.View style={{ flex: innerFlex }} importantForAccessibility="no-hide-descendants">
        <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={{ flex: spacerFlex }} importantForAccessibility="no" />
    </View>
  );
}
