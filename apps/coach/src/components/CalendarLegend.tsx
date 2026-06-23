/**
 * CalendarLegend — a tiny key for the calendar day-markers.
 *
 * The red dot under a day in the MONTH grid means different things by screen: on Home ("Mon
 * planning") it marks a CONFIRMED session; on Disponibles it marks an AVAILABLE (open) session.
 * Same glyph, opposite meaning — so each calendar states its own (coach feedback 2026-06:
 * "what does the red dot represent — confirmed or available?"). The screen passes the items it
 * wants shown, so it stays extensible if a second marker is ever added (DT-13).
 *
 * Each item is grouped for screen readers (the dot is decorative; the label is the accessible name).
 */
import React from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { spacing as sp, surfaces } from '../theme/theme';

const S = surfaces.coach;

export type LegendItem = { color: string; label: string };

export function CalendarLegend({ items, style }: { items: LegendItem[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[st.row, style]}>
      {items.map((it) => (
        <View key={it.label} style={st.item} accessible accessibilityLabel={it.label}>
          <View style={[st.dot, { backgroundColor: it.color }]} />
          <Text style={st.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.md, marginTop: sp.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  // Matches the calendar's 5px day dot (one px up reads better next to the label).
  dot: { width: 6, height: 6, borderRadius: 999 },
  label: { fontFamily: 'Inter_400Regular', fontSize: 13, color: S.textSecondary },
});
