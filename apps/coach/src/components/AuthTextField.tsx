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
import React, { useState, useRef, useCallback, type ReactNode } from 'react';
import {
  Pressable, StyleSheet, Text, TextInput, View,
  type StyleProp, type TextInputProps, type ViewStyle,
} from 'react-native';

import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { type LucideIcon } from '../icons';

const CARD = palette.neutral[0];
const BORDER = palette.neutral[200];
const BORDER_ERR = 'rgba(234,56,41,0.65)';
const ICON = palette.neutral[500];
const PLACEHOLDER = palette.neutral[600];
const TXT = palette.neutral[900];
const ON_2 = palette.neutral[600];
const MUTED = palette.neutral[600];
// Field labels use Inter (the body family, same as the input) — Oswald is a condensed display face
// that reads cramped at label size. Matches the common form pattern (cf. Forest / ClickUp on Mobbin).
const F = { label: 'Inter_600SemiBold', body: 'Inter_400Regular' };

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
  const localRef = useRef<TextInput>(null);
  // Merge the caller's ref (used to focus-chain between fields) with our own, so a tap anywhere on
  // the field row — the icon, the padding, the gaps — focuses the input and opens the native
  // keyboard, not just the inner TextInput's own glyph area.
  const setInputRef = useCallback((node: TextInput | null) => {
    localRef.current = node;
    if (typeof inputRef === 'function') inputRef(node);
    else if (inputRef && typeof inputRef === 'object') {
      (inputRef as React.MutableRefObject<TextInput | null>).current = node;
    }
  }, [inputRef]);

  return (
    <View style={containerStyle}>
      <View style={st.labelRow}>
        <Text style={st.label}>{label}</Text>
        {optional ? <Text style={st.optional}>{optional}</Text> : null}
      </View>
      {/* Whole row is the tap target (accessible={false} keeps the TextInput as the a11y node). */}
      <Pressable
        style={[st.wrap, focused && st.wrapFocus, error && st.wrapError]}
        onPress={() => localRef.current?.focus()}
        accessible={false}
      >
        {Icon ? <Icon size={18} color={ICON} /> : null}
        <TextInput
          ref={setInputRef}
          style={[st.input, style]}
          placeholderTextColor={PLACEHOLDER}
          selectionColor={color.action}
          accessibilityLabel={accessibilityLabel ?? label}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          {...rest}
        />
        {trailing}
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
  // Focus = red border + a faint red halo, so the active field reads as a deliberate state (not just
  // a colour swap). iOS-first; Android keeps the border-colour cue (no elevation, to avoid a grey box).
  wrapFocus: {
    borderColor: color.action,
    shadowColor: color.action, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.16, shadowRadius: 5,
  },
  wrapError: { borderColor: BORDER_ERR },
  input: { flex: 1, fontFamily: F.body, fontSize: 16, color: TXT, paddingVertical: 14 },
  help: { fontFamily: F.body, fontSize: 13, lineHeight: 16, color: MUTED, marginTop: 6 },
});
