/**
 * Reveal — cross-fades a layout-matching skeleton into the real content once it has "loaded".
 *
 * While `loading`, the skeleton sits on top (the content is mounted underneath, already laid out,
 * at opacity 0). When loading clears, the skeleton fades OUT fast (exit) while the content fades
 * IN and rises the last 8px (entrance) — asymmetric timing so the system feels responsive, never
 * sluggish. Nothing appears "from nothing": the content is already there, we only reveal it.
 *
 * Reduced motion (vestibular safety, non-negotiable): no fade, no rise — the swap is instant,
 * matching the app's house style (BottomSheet / OnboardingFlow use `reduced ? 0 : …`).
 */
import React from 'react';
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '../lib/useReducedMotion';
import { ease, dur } from '../lib/motion';
import { SkeletonProvider } from './Skeleton';

const RISE = 8; // px the content travels on entrance (kept tiny — minimal vestibular footprint)

export function Reveal({
  loading, skeleton, children, style,
}: {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const [showSkeleton, setShowSkeleton] = React.useState(loading);
  const contentOpacity = React.useRef(new Animated.Value(loading ? 0 : 1)).current;
  const contentY = React.useRef(new Animated.Value(loading ? RISE : 0)).current;
  const skeletonOpacity = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (loading) {
      // (Re)entering the loading state — show the skeleton immediately, reset the content.
      setShowSkeleton(true);
      skeletonOpacity.setValue(1);
      contentOpacity.setValue(0);
      contentY.setValue(reduced ? 0 : RISE);
      return;
    }
    if (reduced) {
      contentOpacity.setValue(1);
      contentY.setValue(0);
      setShowSkeleton(false);
      return;
    }
    Animated.parallel([
      // exit — faster, accelerating out
      Animated.timing(skeletonOpacity, { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: true }),
      // entrance — standard ease-out, fade + settle
      Animated.timing(contentOpacity, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }),
      Animated.timing(contentY, { toValue: 0, duration: dur.base, easing: ease.out, useNativeDriver: true }),
    ]).start(({ finished }) => { if (finished) setShowSkeleton(false); });
  }, [loading, reduced, contentOpacity, contentY, skeletonOpacity]);

  return (
    <View style={[styles.fill, style]}>
      <Animated.View style={[styles.fill, { opacity: contentOpacity, transform: [{ translateY: contentY }] }]}>
        {children}
      </Animated.View>
      {showSkeleton ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: skeletonOpacity }]} pointerEvents="none">
          <SkeletonProvider>{skeleton}</SkeletonProvider>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
