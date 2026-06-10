/**
 * AuthTextField — the labelled input shared by the login and sign-up forms.
 *
 * One source for the auth input: a visible label (kept, not placeholder-only — for cognitive a11y
 * and screen readers), an optional leading icon, a red focus ring, an error border, and an optional
 * trailing slot (e.g. the password show/hide toggle). Self-manages its focus state and forwards all
 * standard TextInputProps (keyboardType, autoComplete, returnKeyType, …) so callers stay declarative.
 *
 * Surface = coach (ink): dark field, light text, neutral placeholder. Pairs the visible label with
 * an accessibilityLabel on the input — RN has no <label for> association, so the input needs its own
 * accessible name.
 */
import React, { useState, type ReactNode } from 'react';
import {
  StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type ViewStyle,
} from 'react-native';

import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { type LucideIcon } from '../icons';

const CARD = palette.neutral[800];
const BORDER = 'rgba(255,255,255,0.10)';
const BORDER_ERR = 'rgba(225,50,43,0.65)';
const ICON = palette.neutral[400];
const PLACEHOLDER = palette.neutral[500];
const TXT = palette.neutral[50];
const ON_2 = palette.neutral[300];
const MUTED = palette.neutral[500];
const F = { oswS: 'Oswald_600SemiBold', body: 'Inter_400Regular' };

type Props = {
  label: string;
  icon?: LucideIcon;
  error?: boolean;
  /** Trailing slot inside the field — e.g. a show/hide password button. */
  trailing?: ReactNode;
  /** Small tag next to the label, e.g. "optional". */
  optional?: string;
  /** Hint shown under the field. */
  help?: string;
  /** Style for the outer container (margins / flex when laid out in a row). */
  containerStyle?: StyleProp<ViewStyle>;
  inputRef?: React.Ref<TextInput>;
} & TextInputProps;

export function AuthTextField({
  label, icon: Icon, error, trailing, optional, help, containerStyle, inputRef,
  onFocus, onBlur, accessibilityLabel, style, ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={containerStyle}>
      <View style={st.labelRow}>
        <Text style={st.label}>{label}</Text>
        {optional ? <Text style={st.optional}>{optional}</Text> : null}
      </View>
      <View style={[st.wrap, focused && st.wrapFocus, error && st.wrapError]}>
        {Icon ? <Icon size={18} color={ICON} /> : null}
        <TextInput
          ref={inputRef}
          style={[st.input, style]}
          placeholderTextColor={PLACEHOLDER}
          selectionColor={color.action}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...rest}
        />
        {trailing}
      </View>
      {help ? <Text style={st.help}>{help}</Text> : null}
    </View>
  );
}

const st = StyleSheet.create({
  labelRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: sp.md, marginBottom: sp.xs,
  },
  label: { fontFamily: F.oswS, fontSize: 13, letterSpacing: 0.5, color: ON_2 },
  optional: { fontFamily: F.body, fontSize: 12, color: MUTED },
  wrap: {
    flexDirection: 'row', alignItems: 'center', gap: sp.sm, minHeight: 54,
    paddingHorizontal: sp.md, borderRadius: r.lg, backgroundColor: CARD,
    borderWidth: 1.5, borderColor: BORDER,
  },
  wrapFocus: { borderColor: color.action },
  wrapError: { borderColor: BORDER_ERR },
  input: { flex: 1, fontFamily: F.body, fontSize: 16, color: TXT, paddingVertical: 14 },
  help: { fontFamily: F.body, fontSize: 12, lineHeight: 16, color: MUTED, marginTop: 6 },
});
