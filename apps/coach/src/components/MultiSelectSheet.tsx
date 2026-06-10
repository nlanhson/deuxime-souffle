/**
 * MultiSelectSheet — a multiple-choice picker inside the shared BottomSheet.
 *
 * Used where a row holds a SET of values rather than one (the Weekly-schedule day picker). Options
 * render as toggle pills that wrap; tapping flips each on/off (multi-select), and the choice is
 * committed on Save (so a mis-tap is recoverable, unlike the single-select OptionSheet which closes
 * on tap). Coach surface (ink). UI labels come from the caller (the localization seam in ../copy).
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { X } from '../icons';
import { palette, color, spacing as sp, radius as r } from '../theme/theme';
import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './PrimaryButton';

const ON_CARD = palette.neutral[50];
const ON_CARD_2 = palette.neutral[300];
const ON_CARD_3 = palette.neutral[500];
const SUBTLE = palette.neutral[800];
const F = { bodyB: 'Inter_700Bold', bodyS: 'Inter_600SemiBold', body: 'Inter_400Regular' };

export type MultiOption = { key: string; label: string };

export function MultiSelectSheet({
  visible, onClose, title, help, options, selected, onSave,
  saveLabel = 'Save', cancelLabel = 'Cancel', closeA11y,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  options: MultiOption[];
  selected: string[];
  onSave: (keys: string[]) => void;
  saveLabel?: string;
  cancelLabel?: string;
  closeA11y?: string;
}) {
  const [sel, setSel] = React.useState<string[]>(selected);
  // Seed from the current value each time the sheet opens (so a cancelled edit is discarded).
  React.useEffect(() => { if (visible) setSel(selected); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (k: string) =>
    setSel((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

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

      <View style={st.wrap}>
        {options.map((o) => {
          const on = sel.includes(o.key);
          return (
            <Pressable
              key={o.key}
              onPress={() => toggle(o.key)}
              style={[st.chip, on && st.chipOn]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={o.label}
            >
              <Text style={[st.chipTxt, on && st.chipTxtOn]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={st.actions}>
        <Pressable
          style={({ pressed }) => [st.cancel, pressed && { opacity: 0.7 }]}
          onPress={onClose}
          accessibilityRole="button"
        >
          <Text style={st.cancelTxt}>{cancelLabel}</Text>
        </Pressable>
        <PrimaryButton label={saveLabel} onPress={() => { onSave(sel); onClose(); }} style={{ flex: 1 }} />
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
  help: { fontFamily: F.body, fontSize: 14, lineHeight: 20, color: ON_CARD_2, marginTop: sp.sm },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: sp.sm, marginTop: sp.md },
  chip: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: r.pill,
    backgroundColor: palette.neutral[900], borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)',
  },
  chipOn: { backgroundColor: color.action, borderColor: color.action },
  chipTxt: { fontFamily: F.bodyS, fontSize: 15, color: ON_CARD_2 },
  chipTxtOn: { color: color.onAction },

  actions: { flexDirection: 'row', alignItems: 'center', gap: sp.sm, marginTop: sp.lg },
  cancel: { minHeight: 48, paddingHorizontal: sp.lg, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: F.bodyS, fontSize: 16, letterSpacing: 0.2, color: ON_CARD_3 },
});
