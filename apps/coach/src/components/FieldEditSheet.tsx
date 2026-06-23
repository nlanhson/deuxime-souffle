/**
 * FieldEditSheet — a keyboard-safe form sheet for editing one or more fields.
 *
 * The shared BottomSheet is bottom-anchored and content-sized — great for confirms/option lists,
 * but a text form needs to ride above the keyboard. So this mirrors the BottomSheet's look (ink
 * card, grabber, top-lit gradient, dimmed backdrop) AND its animation: the tinted black backdrop
 * FADES in/out (Animated opacity) while the card SLIDES (translateY) — driven by one progress
 * value with animationType="none", so the tint never slides in as one layer with the card. Fields
 * render through the shared AuthTextField; an optional single-select `choice` renders as a
 * segmented control under them. `onSave` receives the field values (+ the chosen option) only
 * after `validate` passes.
 *
 * Reduced motion (vestibular safety, non-negotiable): the card cross-fades in place — no slide —
 * while the backdrop still fades. Coach surface (ink). UI labels come from the caller (../copy).
 */
import React from 'react';
import {
  Modal, KeyboardAvoidingView, Platform, View, Text, Pressable, ScrollView, StyleSheet,
  Animated, Easing,
  type KeyboardTypeOptions, type ReturnKeyTypeOptions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { X } from '../icons';
import { palette, color, spacing as sp, radius as r, motion, cardGradient } from '../theme/theme';
import { useReducedMotion } from '../lib/useReducedMotion';
import { AuthTextField } from './AuthTextField';
import { PrimaryButton } from './PrimaryButton';

const CARD = palette.neutral[0];
const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const ON_CARD_3 = palette.neutral[600];
const SUBTLE = palette.neutral[100];
const TINT = 'rgba(0,0,0,0.6)';
const FALLBACK_H = 600; // off-screen start until the card is measured
const F = { bodyB: 'Inter_700Bold', bodyS: 'Inter_600SemiBold', body: 'Inter_400Regular' };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type EditField = {
  key: string;
  label: string;
  value: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  help?: string;
  placeholder?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: ReturnKeyTypeOptions;
};

export type EditChoice = { label: string; options: string[]; value: string };

export function FieldEditSheet({
  visible, onClose, title, fields, choice, saveLabel = 'Save', cancelLabel = 'Cancel',
  onSave, validate, closeA11y,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  fields: EditField[];
  choice?: EditChoice;
  saveLabel?: string;
  cancelLabel?: string;
  onSave: (values: Record<string, string>, choiceValue?: string) => void;
  validate?: (values: Record<string, string>, choiceValue?: string) => string | null;
  closeA11y?: string;
}) {
  const reduced = useReducedMotion();
  const [vals, setVals] = React.useState<Record<string, string>>({});
  const [choiceVal, setChoiceVal] = React.useState<string | undefined>(choice?.value);
  const [error, setError] = React.useState<string | null>(null);

  // Keep the sheet mounted through its exit animation (like BottomSheet) so the tint can fade out.
  const [mounted, setMounted] = React.useState(visible);
  const [height, setHeight] = React.useState(0);
  const progress = React.useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open

  // Seed local state from the fields each time the sheet opens (so reopening discards edits).
  React.useEffect(() => {
    if (!visible) return;
    const init: Record<string, string> = {};
    fields.forEach((f) => { init[f.key] = f.value; });
    setVals(init);
    setChoiceVal(choice?.value);
    setError(null);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mount on open; on close, play the exit (fade tint + slide card) first, then unmount.
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

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [height || FALLBACK_H, 0],
  });

  const a11y = closeA11y ?? 'Close';

  const save = () => {
    const err = validate?.(vals, choiceVal) ?? null;
    if (err) { setError(err); return; }
    onSave(vals, choiceVal);
    onClose();
  };

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <View style={st.fill} accessibilityViewIsModal>
        {/* Tinted black — a sibling behind the card so its opacity FADES without fading the card. */}
        <AnimatedPressable
          style={[StyleSheet.absoluteFill, { backgroundColor: TINT, opacity: progress }]}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={a11y}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={st.kav}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              st.card,
              // Reduced motion → cross-fade in place (no translate); otherwise slide, card stays opaque.
              reduced ? { opacity: progress } : { transform: [{ translateY }] },
            ]}
            onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
          >
            <LinearGradient
              colors={cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[StyleSheet.absoluteFill, { borderTopLeftRadius: r['2xl'], borderTopRightRadius: r['2xl'] }]}
              pointerEvents="none"
            />
            <View style={st.grabber} />

            <View style={st.head}>
              <Text style={st.title} numberOfLines={1}>{title}</Text>
              <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={a11y}>
                <X size={22} color={ON_CARD} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
              style={st.scroll}
              contentContainerStyle={{ paddingBottom: sp.sm }}
            >
              {fields.map((f) => (
                <AuthTextField
                  key={f.key}
                  label={f.label}
                  value={vals[f.key] ?? ''}
                  onChangeText={(t) => setVals((v) => ({ ...v, [f.key]: t }))}
                  keyboardType={f.keyboardType}
                  secureTextEntry={f.secureTextEntry}
                  placeholder={f.placeholder}
                  autoCapitalize={f.autoCapitalize}
                  returnKeyType={f.returnKeyType}
                  help={f.help}
                  error={!!error}
                />
              ))}

              {choice ? (
                <View style={st.choiceBlock}>
                  <Text style={st.choiceLabel}>{choice.label}</Text>
                  <View style={st.segTrack} accessibilityRole="radiogroup">
                    {choice.options.map((opt) => {
                      const on = opt === choiceVal;
                      return (
                        <Pressable
                          key={opt}
                          style={[st.seg, on && st.segOn]}
                          onPress={() => setChoiceVal(opt)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: on }}
                        >
                          <Text style={[st.segTxt, on && st.segTxtOn]} numberOfLines={1}>{opt}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              {error ? <Text style={st.error}>{error}</Text> : null}
            </ScrollView>

            <View style={st.actions}>
              <Pressable
                style={({ pressed }) => [st.cancel, pressed && { opacity: 0.7 }]}
                onPress={onClose}
                accessibilityRole="button"
              >
                <Text style={st.cancelTxt}>{cancelLabel}</Text>
              </Pressable>
              <PrimaryButton label={saveLabel} onPress={save} style={{ flex: 1 }} />
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  fill: { flex: 1 },
  kav: { flex: 1, justifyContent: 'flex-end' },
  card: {
    width: '100%', maxHeight: '88%', backgroundColor: CARD,
    borderTopLeftRadius: r['2xl'], borderTopRightRadius: r['2xl'],
    paddingHorizontal: sp.lg, paddingTop: sp.md, paddingBottom: sp.xl,
    borderWidth: 1, borderBottomWidth: 0, borderColor: 'rgba(24,23,21,0.07)',
    shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.4, shadowRadius: 28,
  },
  grabber: {
    alignSelf: 'center', width: 36, height: 4, borderRadius: 999,
    backgroundColor: palette.neutral[300], marginBottom: sp.sm,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: sp.sm },
  title: { flex: 1, fontFamily: F.bodyB, fontSize: 22, color: ON_CARD },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  scroll: { flexGrow: 0 },

  /* segmented choice (e.g. Strict / Flexible) */
  choiceBlock: { marginTop: sp.md },
  choiceLabel: { fontFamily: 'Oswald_600SemiBold', fontSize: 13, letterSpacing: 0.5, color: ON_CARD_2, marginBottom: sp.xs },
  segTrack: { flexDirection: 'row', gap: 6, padding: 4, backgroundColor: palette.neutral[100], borderRadius: r.pill },
  seg: { flex: 1, minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: color.action },
  segTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD_2 },
  segTxtOn: { color: color.onAction },

  error: { fontFamily: F.body, fontSize: 13, color: palette.rouge[700], marginTop: sp.sm }, // DT-20: AA error text on light

  actions: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.lg },
  cancel: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.button, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD_3 },
});
