/**
 * BadgeCelebration — the "you just reached a new tier" moment.
 *
 * Gamification only feels like gamification at the instant of reward (Finch's "Milestone reached!",
 * Any Distance's medal reveal). Without this, a new tier would just silently appear in the Progression
 * tab; this is the beat that makes climbing a rung feel good. One per app, mounted at the root: it
 * watches the celebration queue and takes over the screen when a tier is crossed.
 *
 * House style (papier calme): a centred WHITE card over a dimmed scrim — the only place the app
 * allows a shadow (overlays) and a real entrance flourish (a tier-up is rare → delight is
 * earned here, unlike the everyday UI which stays calm). The medal wears the signature rouge→or
 * gradient ring the theme reserves for "medals / progress". Tone stays on-brand: recognition, never
 * pay.
 *
 * Motion safety (non-negotiable): the spring + the confetti are DECORATIVE. Under Reduce Motion we
 * drop both entirely — the card and medal cross-fade in place, no scale, no travel, no drifting
 * flecks. The confetti is a one-shot drift (never loops, never strobes — well under 3 flashes/sec).
 */
import React from 'react';
import {
  AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, Text, View,
} from 'react-native';
import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { ease, dur } from '../lib/motion';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useCopy } from '../i18n';
import { PrimaryButton } from './PrimaryButton';
import { HeroMedal } from './HeroMedal';
import { TIERS, type TierKey } from '../lib/gamification';
import { useTierCelebration, dismissCurrentTier } from '../lib/badgeCelebration';

const S = surfaces.coach;
const GOLD_FG = palette.or[800];
const TINT = 'rgba(0,0,0,0.55)';
const CONFETTI_COLORS = [palette.rouge[500], palette.or[500], palette.or[300]];
const CONFETTI_COUNT = 12;

const F = {
  display: 'Anton_400Regular',
  oswB: 'Oswald_700Bold',
  body: 'Inter_400Regular',
  bodyS: 'Inter_600SemiBold',
};

/* ---------- confetti (decorative — mounted only when motion is allowed) ---------- */

function Fleck({ index }: { index: number }) {
  // Deterministic spread from the index (no Math.random — stable, and avoids a needless re-seed).
  const spread = (index / (CONFETTI_COUNT - 1)) * 2 - 1; // -1 … 1 across the card
  const dx = spread * 150;
  const drop = 120 + (index % 4) * 26;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = index % 3 === 0 ? 9 : 6;

  const t = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(t, {
      toValue: 1,
      duration: 760,
      delay: (index % 6) * 45, // gentle stagger — the cascade reads as livelier than a single pop
      easing: ease.out,
      useNativeDriver: true,
    }).start();
  }, [t, index]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-10, drop] });
  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
  const rotate = t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', index % 2 ? '220deg' : '-200deg'] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 4,
        width: size,
        height: size * 1.4,
        borderRadius: 2,
        backgroundColor: color,
        opacity,
        transform: [{ translateX }, { translateY }, { rotate }],
      }}
    />
  );
}

/* ---------- overlay ---------- */

export function BadgeCelebration({ tierKey }: { tierKey: TierKey | null }) {
  const copy = useCopy();
  const c = copy.game;
  const reduced = useReducedMotion();

  // Keep the card mounted through its exit fade (the queue clears the moment we dismiss).
  const [shownKey, setShownKey] = React.useState<TierKey | null>(tierKey);
  const scrim = React.useRef(new Animated.Value(0)).current;
  const cardOpacity = React.useRef(new Animated.Value(0)).current;
  const cardScale = React.useRef(new Animated.Value(reduced ? 1 : 0.92)).current;
  const medalScale = React.useRef(new Animated.Value(reduced ? 1 : 0.9)).current;

  React.useEffect(() => {
    if (tierKey) {
      setShownKey(tierKey);
      const name = c.tiers[tierKey]?.name ?? '';
      AccessibilityInfo.announceForAccessibility(`${c.celebrate.announce} ${name}`);

      scrim.setValue(0);
      cardOpacity.setValue(0);
      cardScale.setValue(reduced ? 1 : 0.92);
      medalScale.setValue(reduced ? 1 : 0.9);

      if (reduced) {
        // Opacity only — vestibular-safe. No scale, no spring, no confetti.
        Animated.parallel([
          Animated.timing(scrim, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }),
          Animated.timing(cardOpacity, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }),
        ]).start();
        return;
      }
      Animated.parallel([
        Animated.timing(scrim, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: dur.base, easing: ease.out, useNativeDriver: true }),
        // Card eases up from 0.92 (never 0 — nothing appears from nothing).
        Animated.spring(cardScale, { toValue: 1, speed: 14, bounciness: 6, useNativeDriver: true }),
        // Medal lands a beat later with a touch more life — the focal point of the moment.
        Animated.spring(medalScale, { toValue: 1, speed: 12, bounciness: 9, delay: 90, useNativeDriver: true }),
      ]).start();
    }
  }, [tierKey, reduced, c, scrim, cardOpacity, cardScale, medalScale]);

  const close = React.useCallback(() => {
    Animated.parallel([
      // Exit is snappier than the entrance (asymmetric timing — the system responding, fast).
      Animated.timing(scrim, { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 0, duration: dur.fast, easing: ease.in, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setShownKey(null);
        dismissCurrentTier(); // acknowledge + advance the queue
      }
    });
  }, [scrim, cardOpacity]);

  if (!shownKey) return null;
  const tier = TIERS.find((t) => t.key === shownKey);
  const meta = c.tiers[shownKey];
  if (!tier || !meta) return null;
  const Icon = tier.icon;

  return (
    <Modal visible transparent animationType="none" onRequestClose={close} statusBarTranslucent>
      <View style={st.root}>
        <Animated.View style={[StyleSheet.absoluteFill, st.scrim, { opacity: scrim }]} />

        <Animated.View
          style={[st.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
          accessibilityViewIsModal
        >
          {/* confetti sits behind the medal, scoped to the card; decorative → motion-gated */}
          {!reduced ? (
            <View pointerEvents="none" style={st.confetti} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {Array.from({ length: CONFETTI_COUNT }, (_, i) => <Fleck key={i} index={i} />)}
            </View>
          ) : null}

          <Text style={st.eyebrow}>{c.celebrate.eyebrow}</Text>

          <Animated.View style={[st.medal, { transform: [{ scale: medalScale }] }]}>
            <HeroMedal Icon={Icon} ringSize={104} iconSize={42} />
          </Animated.View>

          <Text style={st.name} numberOfLines={2}>{meta.name}</Text>
          <Text style={st.desc}>{meta.desc}</Text>
          <Text style={st.today}>{c.celebrate.today}</Text>
          <Text style={st.subtitle}>{c.celebrate.subtitle}</Text>

          <PrimaryButton
            label={c.celebrate.cta}
            onPress={close}
            style={{ alignSelf: 'stretch', marginTop: sp.lg }}
            accessibilityLabel={`${c.celebrate.cta}. ${c.celebrate.announce} ${meta.name}`}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

/** Mounted once at the app root — bridges the celebration queue to the overlay. */
export function BadgeCelebrationHost() {
  const tierKey = useTierCelebration();
  return <BadgeCelebration tierKey={tierKey} />;
}

const st = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.lg },
  scrim: { backgroundColor: TINT },
  card: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: palette.neutral[0],
    borderRadius: r.xl,
    paddingHorizontal: sp.lg,
    paddingTop: sp.xl,
    paddingBottom: sp.lg,
    overflow: 'hidden',
    // Overlay shadow — the one place the flat-card house style lifts off the page.
    shadowColor: '#181715', shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.22, shadowRadius: 32,
    elevation: 12,
  },
  confetti: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center' },
  eyebrow: { fontFamily: F.oswB, fontSize: 13, letterSpacing: 1.2, color: GOLD_FG, textTransform: 'uppercase' },
  medal: { marginTop: sp.md, marginBottom: sp.md },
  name: { fontFamily: F.display, fontSize: 30, lineHeight: 36, color: S.textPrimary, textAlign: 'center', textTransform: 'uppercase' },
  desc: { fontFamily: F.body, fontSize: 15, lineHeight: 21, color: S.textSecondary, textAlign: 'center', marginTop: sp.xs },
  today: { fontFamily: F.bodyS, fontSize: 13, color: GOLD_FG, marginTop: sp.sm },
  subtitle: { fontFamily: F.body, fontSize: 13, lineHeight: 19, color: S.textSecondary, textAlign: 'center', marginTop: sp.md },
});
