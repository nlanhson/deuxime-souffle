/**
 * BottomSheet — the shared slide-up sheet used by the app's action popups (ActionModal,
 * CheckInModal, the Notification detail). Mirrors the Earnings sheet's language: a card anchored
 * to the bottom edge with a grabber handle, over a dimmed backdrop.
 *
 * The native Modal's animationType="slide" translates the whole layer (backdrop + card) as one,
 * so the tint slides in with the sheet. We want the tinted black to FADE in/out while the card
 * SLIDES, so we drive both with the Animated API (animationType="none") and keep the sheet
 * mounted through its exit animation.
 *
 * Reduced motion (vestibular safety, non-negotiable): no slide — the card cross-fades in place
 * alongside the backdrop, instantly. Movement is what triggers motion sickness; opacity is safe.
 */
import React from 'react';
import {
  AccessibilityInfo, Animated, Easing, Modal, Pressable, StyleSheet, View,
  type StyleProp, type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { palette, spacing as sp, radius as r, surfaces, motion, cardGradient } from '../theme/theme';

const CARD = surfaces.coach.surface; // dark ink card in both schemes
const TINT = 'rgba(0,0,0,0.6)';
const FALLBACK_H = 900;              // off-screen start until the card is measured

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mirror of the screens' reduced-motion hook (AccueilScreen / DisponiblesScreen).
function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    let on = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (on) setReduced(v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { on = false; sub.remove(); };
  }, []);
  return reduced;
}

export function BottomSheet({
  visible, onClose, a11yLabel, dismissable = true, children, contentStyle,
}: {
  visible: boolean;
  onClose: () => void;
  a11yLabel?: string;
  /** When false, tapping the backdrop won't dismiss (e.g. mid-flow). The card still renders. */
  dismissable?: boolean;
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = React.useState(visible);
  const [height, setHeight] = React.useState(0);
  const progress = React.useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open

  // Mount on open; on close, play the exit animation first, then unmount.
  React.useEffect(() => {
    if (visible) {
      setMounted(true);
    } else if (mounted) {
      Animated.timing(progress, {
        toValue: 0,
        duration: reduced ? 0 : motion.duration.fast,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => { if (finished) setMounted(false); });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enter once mounted and measured, so the card slides up from exactly its own height.
  React.useEffect(() => {
    if (visible && mounted && height > 0) {
      Animated.timing(progress, {
        toValue: 1,
        duration: reduced ? 0 : motion.duration.base,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, mounted, height, reduced, progress]);

  const backdropOpacity = progress; // tinted black fades in/out
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height || FALLBACK_H, 0],
  });

  return (
    <Modal visible={mounted} onRequestClose={onClose} transparent animationType="none">
      <View style={st.fill} accessibilityViewIsModal>
        {/* Tinted black — a sibling behind the card so its opacity doesn't fade the card too. */}
        <AnimatedPressable
          style={[StyleSheet.absoluteFill, { backgroundColor: TINT, opacity: backdropOpacity }]}
          onPress={dismissable ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel={a11yLabel}
        />
        <Animated.View
          style={[
            st.card,
            contentStyle,
            // Reduced motion → cross-fade in place (no translate); otherwise slide, card stays opaque.
            reduced ? { opacity: progress } : { transform: [{ translateY }] },
          ]}
          onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        >
          {/* Shared card gradient (top-lit → base), top corners only — bottom is flush to the edge. */}
          <LinearGradient
            colors={cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderTopLeftRadius: r['2xl'], borderTopRightRadius: r['2xl'] }]}
            pointerEvents="none"
          />
          <View style={st.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  card: {
    width: '100%', backgroundColor: CARD,
    borderTopLeftRadius: r['2xl'], borderTopRightRadius: r['2xl'],
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.xl,
    // shadcn-style hairline edge so the sheet reads as a crisp panel above the dimmed backdrop.
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.4, shadowRadius: 28,
  },
  // Grabber handle — the bottom-sheet affordance that signals "slides up / swipe area".
  grabber: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 999,
    backgroundColor: palette.neutral[700], marginBottom: sp.sm,
  },
});
