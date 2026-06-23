/**
 * JS fallback Segmented — branded, no native module. Used on web, pre-13 iOS, and
 * always for the 'underline' variant (which has no UISegmentedControl analogue).
 *
 * Two looks:
 *  - 'pill'      — recessed pill track, the selected segment a filled pill that SLIDES
 *                  between segments (mirrors the native control). [default]
 *  - 'underline' — left-aligned tab row, a sliding underline under the active label.
 *
 * Both slide with Easing.out(cubic) over motion.duration.base, snap into place on first
 * layout (no entrance slide), and honour Reduce Motion (snap, no slide).
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, Easing,
  AccessibilityInfo, type LayoutChangeEvent,
} from 'react-native';

import { radius as r, spacing as sp, motion } from '../../theme/theme';
import { DEFAULT_SEGMENTED_THEME, SEGMENTED_FONT, type SegmentedProps } from './types';

const PAD = 4;
const GAP = 4;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => { if (mounted) setReduced(v); });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { mounted = false; sub.remove(); };
  }, []);
  return reduced;
}

export function JsSegmented<T extends string>(props: SegmentedProps<T>) {
  return props.variant === 'underline'
    ? <UnderlineSegmented {...props} />
    : <PillSegmented {...props} />;
}

/* ── Pill: filled selected pill that slides between segments ──────────────────── */

function PillSegmented<T extends string>({
  options, value, onChange, accessibilityLabel, theme, style,
}: SegmentedProps<T>) {
  const t = { ...DEFAULT_SEGMENTED_THEME, ...theme };
  const reduced = useReducedMotion();

  const [trackW, setTrackW] = useState(0);
  const onTrackLayout = (e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width);

  const n = options.length;
  const segW = trackW ? (trackW - PAD * 2 - GAP * (n - 1)) / n : 0;
  const xFor = (i: number) => PAD + i * (segW + GAP);

  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  const tx = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);

  useEffect(() => {
    if (!trackW) return;
    const to = xFor(idx);
    if (reduced || !placed.current) { tx.setValue(to); placed.current = true; return; }
    Animated.timing(tx, {
      toValue: to, duration: motion.duration.base,
      easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, [idx, trackW, reduced]);

  return (
    <View
      onLayout={onTrackLayout}
      style={[
        st.track,
        { backgroundColor: t.track },
        theme?.trackBorder ? { borderWidth: 1, borderColor: theme.trackBorder } : null,
        style,
      ]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {trackW > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[st.thumb, { width: segW, backgroundColor: t.selected, transform: [{ translateX: tx }] }]}
        />
      )}
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={st.seg}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={opt.label}
          >
            <Text style={[st.txt, { color: on ? t.selectedLabel : t.label }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Underline: left-aligned tabs, a sliding underline under the active label ──── */

function UnderlineSegmented<T extends string>({
  options, value, onChange, accessibilityLabel, theme, style, stretch,
}: SegmentedProps<T>) {
  const t = { ...DEFAULT_SEGMENTED_THEME, ...theme };
  const reduced = useReducedMotion();

  const n = options.length;
  const idx = Math.max(0, options.findIndex((o) => o.value === value));

  // Per-tab geometry — underline rides the active tab's exact x + width.
  const [segs, setSegs] = useState<Array<{ x: number; width: number } | undefined>>([]);
  const onSegLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setSegs((prev) => {
      const next = prev.slice();
      next[i] = { x, width };
      return next;
    });
  };
  const ready = n >= 2 && segs.length === n && segs.every(Boolean);

  const pos = useRef(new Animated.Value(idx)).current;
  const placed = useRef(false);
  useEffect(() => {
    if (reduced || !placed.current) { pos.setValue(idx); placed.current = true; return; }
    Animated.timing(pos, {
      toValue: idx, duration: motion.duration.base,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [idx, reduced]);

  const inputRange = options.map((_, i) => i);
  const underlineX = ready
    ? pos.interpolate({ inputRange, outputRange: segs.map((s) => s!.x) })
    : 0;
  const underlineW = ready
    ? pos.interpolate({ inputRange, outputRange: segs.map((s) => s!.width) })
    : 0;

  return (
    <View
      style={[st.tabRow, stretch && st.tabRowStretch, style]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((opt, i) => {
        const on = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onLayout={onSegLayout(i)}
            style={[st.tab, stretch && st.tabStretch]}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={opt.label}
          >
            <Text style={[st.txt, { color: on ? t.selectedLabel : t.label }]}>{opt.label}</Text>
          </Pressable>
        );
      })}
      {ready && (
        <Animated.View
          pointerEvents="none"
          style={[
            st.underline,
            { backgroundColor: t.selectedLabel, width: underlineW, transform: [{ translateX: underlineX }] },
          ]}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  // pill
  track: { flexDirection: 'row', padding: PAD, gap: GAP, borderRadius: r.pill },
  thumb: { position: 'absolute', left: 0, top: PAD, bottom: PAD, borderRadius: r.pill },
  seg: { flex: 1, minHeight: 44, borderRadius: r.pill, alignItems: 'center', justifyContent: 'center' },
  // underline
  tabRow: { flexDirection: 'row', justifyContent: 'center', gap: sp.sm, alignItems: 'flex-end' },
  // stretch: tabs split the full row width evenly (gap/center/minWidth dropped so each is exactly half)
  tabRowStretch: { justifyContent: 'flex-start', gap: 0 },
  tabStretch: { flex: 1, minWidth: 0, paddingHorizontal: 0 },
  tab: { minWidth: 104, minHeight: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: sp.md, paddingBottom: 3 },
  underline: { position: 'absolute', left: 0, bottom: 0, height: 2.5, borderRadius: 2 },
  // shared
  txt: { fontFamily: SEGMENTED_FONT, fontSize: 14, letterSpacing: 0.2 },
});
