/**
 * InkHeader — the coach app's ink "header band" (DT-01 → ink app-shell).
 *
 * An ink panel with rounded bottom corners that anchors the top of a screen — the same identity
 * gesture as the Home hero band, shared chrome so every screen reads as one app. It is ALWAYS a
 * FIXED header: place it as a sibling ABOVE the screen's ScrollView (a direct child of the flex:1
 * root), never inside the scroll — so it stays put while the body scrolls beneath it. Being a
 * full-width child of the root, it needs no negative margin; its own sp.lg gutter lines the title
 * up with the scroll body's sp.lg gutter. Two placements differ only in the top inset:
 *   • variant="tab"   — a tab screen. The root drops SafeAreaView's top edge, so the band owns the
 *                       status-bar inset and bleeds up under the clock/battery.
 *   • variant="sheet" — a pageSheet modal. The sheet is already inset below the status bar, so a
 *                       normal top padding is enough.
 *
 * Header text + icons must use the ink-light tokens (surfaces.coach.ink.textPrimary / .textSecondary)
 * — pass them inline at the call site, since RN text colour doesn't cascade through children.
 */
import React from 'react';
import { View, StyleSheet, type ViewStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing as sp, radius as r, surfaces } from '../theme/theme';

const S = surfaces.coach;

export function InkHeader({
  children, variant = 'tab', style,
}: {
  children: React.ReactNode;
  variant?: 'tab' | 'sheet';
  style?: StyleProp<ViewStyle>;
}) {
  const insets = useSafeAreaInsets();
  const tab = variant === 'tab';
  return (
    <View
      style={[
        st.band,
        { paddingTop: tab ? insets.top + sp.sm : sp.lg }, // tab bleeds under the status bar; sheet is already inset
        style,
      ]}
    >
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  band: {
    backgroundColor: S.ink.bg,
    paddingHorizontal: sp.lg,
    paddingBottom: sp.lg,
    borderBottomLeftRadius: r.xl,
    borderBottomRightRadius: r.xl,
  },
});
