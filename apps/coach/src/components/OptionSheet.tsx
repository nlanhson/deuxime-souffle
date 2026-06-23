/**
 * OptionSheet — a single-select / quick-action list inside the shared BottomSheet.
 *
 * Used wherever a row needs a short, finite set of choices (transport: car/walking · max travel
 * time · profile-photo actions). Selecting an option fires `onSelect(key)` and closes the sheet.
 * The current value carries a red check (never colour alone — the row also reads as selected to
 * a screen reader via accessibilityState). Coach surface (ink): light text on the dark card.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { X, Check, type LucideIcon } from '../icons';
import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { BottomSheet } from './BottomSheet';

const ON_CARD = palette.neutral[900];
const ON_CARD_2 = palette.neutral[600];
const SUBTLE = palette.neutral[100];
const DIVIDER = 'rgba(24,23,21,0.07)';

const F = { bodyB: 'Inter_700Bold', bodyS: 'Inter_600SemiBold' };

export type SheetOption = { key: string; label: string; icon?: LucideIcon; destructive?: boolean };

export function OptionSheet({
  visible, onClose, title, help, options, selectedKey, onSelect, closeA11y,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  options: SheetOption[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  closeA11y?: string;
}) {
  const a11y = closeA11y ?? 'Close';
  return (
    <BottomSheet visible={visible} onClose={onClose} a11yLabel={a11y}>
      <View style={st.head}>
        <Text style={st.title}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={8} style={st.close} accessibilityRole="button" accessibilityLabel={a11y}>
          <X size={22} color={ON_CARD} />
        </Pressable>
      </View>
      {help ? <Text style={st.help}>{help}</Text> : null}

      <View style={st.list}>
        {options.map((o, i) => {
          const Icon = o.icon;
          const on = o.key === selectedKey;
          const fg = o.destructive ? palette.rouge[600] : ON_CARD;
          return (
            <Pressable
              key={o.key}
              style={({ pressed }) => [st.row, i > 0 && st.rowDivider, pressed && { opacity: 0.85 }]}
              onPress={() => { onSelect(o.key); onClose(); }}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={o.label}
            >
              {Icon ? (
                <View style={st.icon}>
                  <Icon size={18} color={o.destructive ? palette.rouge[600] : ON_CARD_2} />
                </View>
              ) : null}
              <Text style={[st.label, { color: fg }]} numberOfLines={1}>{o.label}</Text>
              {on ? <Check size={18} color={color.action} /> : null}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1, fontFamily: F.bodyB, fontSize: 22, color: ON_CARD },
  close: {
    width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SUBTLE,
  },
  help: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 20, color: ON_CARD_2, marginTop: sp.sm },

  list: { marginTop: sp.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: sp.md, minHeight: 52, paddingVertical: sp.sm },
  rowDivider: { borderTopWidth: 1, borderTopColor: DIVIDER },
  icon: {
    width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: palette.neutral[200],
  },
  label: { flex: 1, fontFamily: F.bodyS, fontSize: 16 },
});
