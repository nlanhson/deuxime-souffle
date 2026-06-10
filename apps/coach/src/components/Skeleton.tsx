/**
 * Skeleton — layout-matching placeholders shown while a surface first loads.
 *
 * Motion model (one shared driver, vestibular-safe):
 *  - Normal motion: a single low-contrast highlight SWEEPS across each block, all blocks in sync
 *    off one looped driver (constant motion → `linear`, ~1.2s per pass; well under any flashing
 *    threshold). This is the only motion the skeletons produce.
 *  - Reduced motion: the loop never starts, so blocks render STATIC (no sweep, no pulse — a slow
 *    "breathing" pulse is still a pulsing effect, which vestibular guidance puts on the avoid list).
 *    The load window is brief, so a static placeholder reads fine.
 *
 * Wrap a skeleton tree in <SkeletonProvider> once (Reveal does this for you) so every block shares
 * the one driver instead of spinning up its own loop.
 */
import React from 'react';
import { Animated, Easing, StyleSheet, View, type StyleProp, type ViewStyle, type DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useReducedMotion } from '../lib/useReducedMotion';

const SWEEP_MS = 1200;
// Base fill: a hair of white that reads on both the ink canvas (#171717) and the raised cards
// (#2B2B2B). The travelling highlight is a touch brighter so the sweep stays subtle.
const BASE = 'rgba(255,255,255,0.07)';
const SHEEN: readonly [string, string, string] = ['transparent', 'rgba(255,255,255,0.10)', 'transparent'];

type Ctx = { t: Animated.Value | null; reduced: boolean };
const SkeletonCtx = React.createContext<Ctx>({ t: null, reduced: true });

export function SkeletonProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const t = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (reduced) return; // static under reduced motion — never start the sweep
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: SWEEP_MS, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => { loop.stop(); t.setValue(0); };
  }, [reduced, t]);

  return <SkeletonCtx.Provider value={{ t: reduced ? null : t, reduced }}>{children}</SkeletonCtx.Provider>;
}

export function Skeleton({
  w, h, r = 8, style,
}: {
  w?: DimensionValue;
  h?: DimensionValue;
  r?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { t } = React.useContext(SkeletonCtx);
  const [bw, setBw] = React.useState(0);

  const block: StyleProp<ViewStyle> = [
    { width: w, height: h, borderRadius: r, backgroundColor: BASE, overflow: 'hidden' },
    style,
  ];

  // Static (reduced motion or no provider) — just the base fill.
  if (!t) return <View style={block} />;

  // Sweep: a block-wide highlight translated from just off the left edge to just off the right,
  // so the bright centre passes through the block once per loop.
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [-bw, bw] });
  return (
    <View
      style={block}
      onLayout={(e) => {
        const next = e.nativeEvent.layout.width;
        if (next && Math.abs(next - bw) > 0.5) setBw(next);
      }}
    >
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
        <LinearGradient colors={SHEEN} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}

export function SkeletonCircle({ d, style }: { d: number; style?: StyleProp<ViewStyle> }) {
  return <Skeleton w={d} h={d} r={d / 2} style={style} />;
}
