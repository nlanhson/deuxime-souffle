/**
 * BlankScreen — a reusable, built-but-unwired placeholder. A pageSheet modal with a header
 * (title + close) and a centered empty state, for sub-flows whose real screen doesn't exist
 * yet (e.g. the Sessions overflow-menu destinations: cancel participation, declare absence,
 * transmission notes, application status).
 *
 * Drop-in shape matches the other coach modals (ProfileScreen / ReportScreen): `visible` +
 * `onClose`, plus a `title` so one component can stand in for several destinations. Wire it
 * to a menu item by holding the chosen title in state and toggling `visible` — not done yet,
 * by request.
 *
 * Surface = coach: dark ink canvas, light text inside (same polarity as the session cards).
 */
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { X, Sparkles, type LucideIcon } from '../icons';

import { palette, spacing as sp, radius as r, surfaces } from '../theme/theme';
import { copy } from '../copy';
import { useReducedMotion } from '../lib/useReducedMotion';

const S = surfaces.coach;
const CANVAS = S.canvas;
const SUBTLE = S.colorScheme === 'dark' ? palette.neutral[800] : palette.neutral[100];
const ON_CANVAS = S.textPrimary;
const ON_CANVAS_2 = S.textSecondary;

const F = { oswS: 'Oswald_600SemiBold', body: 'Inter_400Regular', bodyB: 'Inter_700Bold' };

export function BlankScreen({
  visible,
  onClose,
  title,
  body,
  Icon = Sparkles,
}: {
  visible: boolean;
  onClose: () => void;
  /** Header title — lets one placeholder stand in for several destinations. */
  title?: string;
  body?: string;
  Icon?: LucideIcon;
}) {
  // Slide is a full-screen position transition → fall back to no animation under reduced motion.
  const reduced = useReducedMotion();
  return (
    <Modal visible={visible} onRequestClose={onClose} animationType={reduced ? 'none' : 'slide'} presentationStyle="pageSheet">
      <View style={{ flex: 1, backgroundColor: CANVAS }}>
        <View style={st.header}>
          <Text style={st.headerTitle} numberOfLines={1}>{title ?? copy.blank.title}</Text>
          <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={copy.blank.closeA11y}>
            <X size={22} color={ON_CANVAS} />
          </Pressable>
        </View>

        <View style={st.body}>
          <View style={st.iconWrap}>
            <Icon size={30} color={ON_CANVAS_2} />
          </View>
          <Text style={st.bigTitle}>{copy.blank.title}</Text>
          <Text style={st.sub}>{body ?? copy.blank.body}</Text>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: sp.lg, paddingTop: sp.lg, paddingBottom: sp.md,
  },
  headerTitle: { flex: 1, fontFamily: F.oswS, fontSize: 22, color: ON_CANVAS },
  close: {
    width: 40, height: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: sp.xl, gap: sp.sm },
  iconWrap: {
    width: 72, height: 72, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE, marginBottom: sp.sm,
  },
  bigTitle: { fontFamily: F.bodyB, fontSize: 20, color: ON_CANVAS },
  sub: { fontFamily: F.body, fontSize: 15, lineHeight: 22, color: ON_CANVAS_2, textAlign: 'center' },
});
