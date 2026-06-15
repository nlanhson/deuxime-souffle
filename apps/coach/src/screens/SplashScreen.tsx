/**
 * Coach · Splash — the branded launch beat (E01 onboarding).
 *
 * Shown once at launch, after fonts are ready: a gradient brand mark + the "Deuxième Souffle"
 * wordmark on the ink canvas, then it hands off to Welcome. Onboarding is a rare, first-impression
 * moment — the one place a little delight is warranted (the framework says don't animate things
 * users see hundreds of times a day; a launch beat is the opposite of that). This is the IN-APP
 * splash, distinct from the native cold-start splash configured in app.json.
 *
 * Motion: a single ease-out reveal driven off one timeline — the mark scales 0.96 → 1 (never from
 * scale(0)) while the wordmark rises in on a slight stagger. Auto-advances after a short
 * hold; tap anywhere to skip. Honors reduced motion: the scale/translate are dropped and only a
 * brief, vestibular-safe opacity fade remains.
 *
 * Surface = coach (ink). UI text comes from ../copy.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { spacing as sp, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { Logo } from '../components/Logo';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const F = { display: 'Anton_400Regular' };

export function SplashScreen({ onDone, reduced }: { onDone: () => void; reduced: boolean }) {
  const c = copy.auth.splash;
  const t = useRef(new Animated.Value(0)).current;
  const fired = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = () => {
    if (fired.current) return;
    fired.current = true;
    if (timer.current) clearTimeout(timer.current);
    onDone();
  };

  useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: reduced ? dur.base : dur.splash,
      easing: ease.out,
      useNativeDriver: true,
    }).start();
    timer.current = setTimeout(finish, reduced ? 1100 : 1550);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One timeline, offset reveals — a natural stagger without separate animations.
  const markOpacity = t.interpolate({ inputRange: [0, 0.7], outputRange: [0, 1], extrapolate: 'clamp' });
  const wordOpacity = t.interpolate({ inputRange: [0.2, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  const markScale = reduced ? 1 : t.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] });
  const wordY = reduced ? 0 : t.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Pressable
      style={st.root}
      onPress={finish}
      accessibilityRole="button"
      accessibilityLabel={c.a11y}
      accessibilityHint={c.skipA11y}
    >
      <Animated.View style={{ opacity: markOpacity, transform: [{ scale: markScale }] }}>
        <Logo size={112} />
      </Animated.View>

      <View style={st.words}>
        <Animated.Text style={[st.word, { opacity: wordOpacity, transform: [{ translateY: wordY }] }]}>
          {c.wordmark}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: S.canvas, alignItems: 'center', justifyContent: 'center', gap: sp.md },
  words: { alignItems: 'center', gap: sp.sm },
  word: {
    fontFamily: F.display, fontSize: 34, lineHeight: 41, letterSpacing: 0.5,
    color: S.textPrimary, textAlign: 'center', paddingHorizontal: sp.xl,
  },
});
