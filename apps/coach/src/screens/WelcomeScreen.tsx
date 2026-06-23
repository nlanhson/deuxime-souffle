/**
 * Coach · Welcome — first interactive onboarding screen (E01 — Auth & Account).
 *
 * "Le Mouvement" hero composition: a muted, looping clip of the brand's seniors-boxing film fills a rounded
 * card across the top; the value proposition + the single primary CTA sit below on the ink canvas.
 * Contained (not full-bleed) on purpose — the source film is 16:9, so a card crops it cleanly and the
 * white Anton headline keeps a dark, legible ink backdrop instead of fighting the bright footage.
 *
 * Coaches are vetted (accounts go Pending → Active after the DS team verifies documents), so account
 * creation is NOT self-serve — "Apply to join" opens the self-registration note, not a sign-up form.
 *
 * MEDIA:
 *  - HERO_VIDEO: assets/hero/welcome.mp4 — the looping clip. Set to `null` to disable video entirely.
 *  - HERO_IMAGE: assets/hero/welcome.jpg — doubles as the video POSTER (first paint) and the
 *    reduced-motion fallback (no autoplay under prefers-reduced-motion — vestibular safety).
 *
 * Motion: hero clip loops; copy → CTA rise in on a staggered ease-out. Reduced motion: the still
 * poster only, opacity fade, no translate, no stagger.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';

import { palette, color, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { useCopy } from '../i18n';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { Logo } from '../components/Logo';
import { ease, dur } from '../lib/motion';

const S = surfaces.coach;
const ON_2 = palette.neutral[600];
// Screen canvas (background + bottom-scrim target). Light theme: warm-paper canvas, matching the
// other auth screens' S.canvas — the hero photo melts into the paper, not into ink.
const INK = palette.neutral[50];
const F = {
  display: 'Anton_400Regular',
  oswS: 'Oswald_600SemiBold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

// The brand's seniors-boxing film (self-hosted on deuxieme-souffle.com), trimmed + compressed for
// mobile (12s loop, 720×900, ~0.7 MB). Set to `null` to fall back to the still poster everywhere.
const HERO_VIDEO: number | null = require('../../assets/hero/welcome.mp4');
// Still: video poster + reduced-motion fallback. Pexels 6922177 swap-out lives here too.
const HERO_IMAGE = require('../../assets/hero/welcome.jpg');

// Top scrim seats the brand lockup + status bar; bottom scrim melts the card into the ink canvas.
const TOP_SCRIM = ['rgba(23,23,23,0.6)', 'transparent'] as const;
const BOTTOM_SCRIM = ['transparent', INK] as const;

/** Video layer — only mounted when motion is allowed, so reduced-motion never spins up the decoder. */
function HeroVideoLayer() {
  const player = useVideoPlayer(HERO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <VideoView
      player={player}
      contentFit="cover"
      nativeControls={false}
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
}

export function WelcomeScreen({ onLogin, onApply, reduced }: { onLogin: () => void; onApply: () => void; reduced: boolean }) {
  const copy = useCopy();
  const c = copy.auth.welcome;
  const showVideo = !!HERO_VIDEO && !reduced;

  const a = useRef(new Animated.Value(0)).current; // text group
  const b = useRef(new Animated.Value(0)).current; // CTA group

  useEffect(() => {
    if (reduced) {
      a.setValue(1);
      b.setValue(1);
      return;
    }
    Animated.stagger(dur.entryStagger, [
      Animated.timing(a, { toValue: 1, duration: 420, easing: ease.out, useNativeDriver: true }),
      Animated.timing(b, { toValue: 1, duration: 420, easing: ease.out, useNativeDriver: true }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: reduced ? [] : [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <View style={st.root}>
      {/* HERO CARD — fills the space above the copy, rounded at the bottom into the ink canvas. */}
      <View style={st.hero}>
        {/* Poster: instant first paint + the reduced-motion / no-video still. */}
        <Image source={HERO_IMAGE} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        {showVideo && <HeroVideoLayer />}

        <LinearGradient colors={TOP_SCRIM} style={st.topScrim} pointerEvents="none" />
        <LinearGradient colors={BOTTOM_SCRIM} style={st.bottomScrim} pointerEvents="none" />

        {/* Brand lockup over the footage — logo only; the mark carries the brand. */}
        <SafeAreaView edges={['top']} style={st.brandSafe}>
          <View style={st.brand}>
            <Logo size={48} glow color="#FFFFFF" />
          </View>
        </SafeAreaView>
      </View>

      {/* COPY + CTAs on ink. */}
      <SafeAreaView edges={['bottom']} style={st.copySafe}>
        <View style={st.copy}>
          <Animated.View style={rise(a)}>
            <Text style={st.eyebrow}>{c.eyebrow}</Text>
            <Text style={st.title}>{c.title}</Text>
            <Text style={st.bodyTxt}>{c.body}</Text>
          </Animated.View>

          <Animated.View style={[rise(b), st.ctas]}>
            <PrimaryButton label={c.login} onPress={onLogin} style={st.loginBtn} />
            <SecondaryButton label={c.apply} onPress={onApply} style={st.applyBtn} accessibilityLabel={c.applyA11y} />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: INK },

  /* hero card */
  hero: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: palette.neutral[100], // shows under the rounded corners before the poster paints
    borderBottomLeftRadius: r['2xl'],
    borderBottomRightRadius: r['2xl'],
  },
  topScrim: { position: 'absolute', top: 0, left: 0, right: 0, height: 140 },
  bottomScrim: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '34%' },
  brandSafe: { position: 'absolute', top: 0, left: 0, right: 0 },
  brand: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: sp.lg, paddingTop: sp.md },

  /* copy block */
  copySafe: { backgroundColor: INK },
  copy: { paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.lg },
  // Sentence case (brand rule: no all-caps) — the red eyebrow reads as a kicker, not a shout.
  eyebrow: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: color.action, marginBottom: sp.sm },
  // Anton: lineHeight ≥1.2× the size keeps multi-line display type from clipping.
  title: { fontFamily: F.display, fontSize: 40, lineHeight: 48, color: S.textPrimary, marginBottom: sp.sm },
  bodyTxt: { fontFamily: F.body, fontSize: 16, lineHeight: 24, color: ON_2, maxWidth: 340 },

  ctas: { marginTop: sp.lg, gap: sp.md },
  loginBtn: { width: '100%' },
  applyBtn: { width: '100%' },
});
