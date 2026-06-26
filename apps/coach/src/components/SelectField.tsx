/**
 * SelectField — a select-style form field sharing AuthTextField's anatomy (visible label,
 * dark field, red error border, optional tag + help line) but opening a picker sheet instead
 * of editing text. Used by the sign-up form's civility and legal-status fields, which mirror
 * the back-office "Invite a coach" dropdowns.
 *
 * The field itself is a button (RN has no native <select>): it announces its label and the
 * current value, and the caller pairs it with an OptionSheet for the actual choice.
 */
import React from 'react';
import {
  Pressable, StyleSheet, Text, View,
  type StyleProp, type ViewStyle,
} from 'react-native';

import { palette, spacing as sp, radius as r } from '../theme/theme';
import { ChevronDown, type LucideIcon } from '../icons';

const CARD = palette.neutral[0];
const BORDER = palette.neutral[200];
const BORDER_ERR = 'rgba(234,56,41,0.65)';
const ICON = palette.neutral[500];
const PLACEHOLDER = palette.neutral[600];
const TXT = palette.neutral[900];
const ON_2 = palette.neutral[600];
const MUTED = palette.neutral[600];
// Field labels use Inter (the body family), matching AuthTextField — Oswald reads cramped at label size.
const F = { label: 'Inter_600SemiBold', body: 'Inter_400Regular' };

export function SelectField({
  label, value, placeholder, onPress, icon: Icon, optional, error, help, containerStyle,
}: {
  label: string;
  /** Current selection's display label; undefined shows the placeholder. */
  value?: string;
  placeholder?: string;
  onPress: () => void;
  icon?: LucideIcon;
  /** Small tag next to the label, e.g. "optional". */
  optional?: string;
  error?: boolean;
  /** Hint shown under the field. */
  help?: string;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={containerStyle}>
      <View style={st.labelRow}>
        <Text style={st.label}>{label}</Text>
        {optional ? <Text style={st.optional}>{optional}</Text> : null}
      </View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [st.wrap, error && st.wrapError, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: value ?? placeholder ?? '' }}
      >
        {Icon ? <Icon size={18} color={ICON} /> : null}
        <Text style={[st.value, !value && st.placeholderTxt]} numberOfLines={1}>
          {value ?? placeholder ?? ''}
        </Text>
        <ChevronDown size={18} color={ICON} />
      </Pressable>
      {help ? <Text style={st.help}>{help}</Text> : null}
    </View>
  );
}

const st = StyleSheet.create({
  labelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: sp.md, marginBottom: sp.xs,
  },
  label: { fontFamily: F.label, fontSize: 13, letterSpacing: 0.2, color: ON_2 },
  optional: { fontFamily: F.body, fontSize: 13, color: MUTED },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm, minHeight: 54,
    paddingHorizontal: sp.md, borderRadius: r.lg, backgroundColor: CARD,
    borderWidth: 1.5, borderColor: BORDER,
  },
  wrapError: { borderColor: BORDER_ERR },
  value: { flex: 1, fontFamily: F.body, fontSize: 16, color: TXT, paddingVertical: 14 },
  placeholderTxt: { color: PLACEHOLDER },
  help: { fontFamily: F.body, fontSize: 13, lineHeight: 16, color: MUTED, marginTop: 6 },
});
