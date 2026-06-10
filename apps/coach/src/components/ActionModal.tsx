/**
 * ActionModal — a bottom sheet (dimmed backdrop, slides up from the bottom edge) for one focused
 * prompt: an icon, title, body, an optional numbered checklist or a highlighted note, and one or
 * two actions. Anchored to the bottom with a grabber handle, mirroring the Earnings sheet so the
 * app speaks one modal language.
 *
 * Mirrors the NotificationCenter detail popup so the app speaks one modal language. The Home
 * banners (report-due, availability) use it to turn a nudge into an actionable sheet. The icon
 * carries the semantic accent (gold = report, blue = availability); the primary button stays
 * the brand red so "the action" reads the same everywhere.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { X, type LucideIcon } from '../icons';

import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { BottomSheet } from './BottomSheet';

const SUBTLE = palette.neutral[800];
const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];

const F = { oswR: 'Oswald_400Regular', oswS: 'Oswald_600SemiBold', oswM: 'Oswald_500Medium', body: 'Inter_400Regular', bodyS: 'Inter_600SemiBold', bodyB: 'Inter_700Bold' };

export type ActionModalProps = {
  visible: boolean;
  onClose: () => void;
  Icon: LucideIcon;
  accentFg: string;
  accentBg: string;
  eyebrow?: string;
  title: string;
  body: string;
  steps?: readonly string[]; // numbered checklist (e.g. the 6 report steps)
  note?: string;             // a single highlighted summary line (e.g. current availability)
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  closeA11y?: string;
};

export function ActionModal({
  visible, onClose, Icon, accentFg, accentBg, eyebrow, title, body,
  steps, note, primaryLabel, onPrimary, secondaryLabel, onSecondary, closeA11y,
}: ActionModalProps) {
  const a11y = closeA11y ?? 'Close';
  return (
    <BottomSheet visible={visible} onClose={onClose} a11yLabel={a11y}>
          <View style={st.top}>
            <View style={st.icon}>
              <Icon size={26} color={ON_CARD} />
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={a11y}>
              <X size={22} color={ON_CARD} />
            </Pressable>
          </View>

          {eyebrow ? <Text style={st.eyebrow}>{eyebrow}</Text> : null}
          <Text style={st.title}>{title}</Text>
          <Text style={st.body}>{body}</Text>

          {note ? (
            <View style={st.note}>
              <Text style={st.noteTxt}>{note}</Text>
            </View>
          ) : null}

          {steps?.length ? (
            <View style={st.steps}>
              {steps.map((s, i) => (
                <View key={i} style={st.stepRow}>
                  <View style={[st.stepNum, { backgroundColor: accentBg }]}>
                    <Text style={[st.stepNumTxt, { color: accentFg }]}>{i + 1}</Text>
                  </View>
                  <Text style={st.stepTxt}>{s}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [st.primary, pressed && { opacity: 0.9 }]}
            onPress={() => { onPrimary?.(); onClose(); }}
            accessibilityRole="button"
          >
            <Text style={st.primaryTxt}>{primaryLabel}</Text>
          </Pressable>

          {secondaryLabel ? (
            <Pressable
              style={({ pressed }) => [st.secondary, pressed && { opacity: 0.6 }]}
              onPress={() => { onSecondary?.(); onClose(); }}
              accessibilityRole="button"
            >
              <Text style={st.secondaryTxt}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Lighter than the card (neutral-800) so the white glyph sits on a clearly distinct chip.
  icon: {
    width: 52, height: 52, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[700], borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  // Matches the Home card type system: Inter throughout — bold title (like the hero card),
  // muted Inter eyebrow + body, Inter SemiBold note. (Oswald is reserved for section titles.)
  eyebrow: { fontFamily: F.body, fontSize: 12, letterSpacing: 0.3, color: ON_CARD_3, marginTop: sp.md },
  title: { fontFamily: F.bodyB, fontSize: 22, color: ON_CARD, marginTop: 4 },
  body: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CARD_2, marginTop: sp.sm },

  // No box / horizontal padding — the note reads as a left-aligned line flush with the title and
  // address (the SUBTLE background equalled the card colour, so the box was invisible anyway).
  note: { marginTop: sp.md },
  noteTxt: { fontFamily: F.bodyS, fontSize: 14, color: ON_CARD, letterSpacing: 0.2, textAlign: 'left' },

  steps: { marginTop: sp.md, gap: sp.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: sp.sm },
  stepNum: { width: 24, height: 24, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  stepNumTxt: { fontFamily: F.bodyS, fontSize: 13 },
  stepTxt: { flex: 1, fontFamily: F.body, fontSize: 14, color: ON_CARD_2 },

  primary: {
    minHeight: 48, borderRadius: r.pill, backgroundColor: color.action,
    alignItems: 'center', justifyContent: 'center', marginTop: sp.lg,
  },
  primaryTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: color.onAction },
  secondary: { minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center', marginTop: sp.xs },
  secondaryTxt: { fontFamily: F.bodyS, fontSize: 14, letterSpacing: 0.2, color: ON_CARD_3 },
});
