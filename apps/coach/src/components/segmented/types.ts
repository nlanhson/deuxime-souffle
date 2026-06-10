/**
 * Shared contract for the adaptive Segmented control (native ↔ JS).
 *
 * Generic over a string-union value `T` so a call site stays type-safe
 * (e.g. `'week' | 'month'`). Theming is per-call-site because the three
 * toggles in the app each tint their selected segment differently
 * (subtle / sunk / brand-red) — those map straight onto UISegmentedControl's
 * `tintColor` on the native path and the pill background on the JS path.
 */
import type { StyleProp, ViewStyle } from 'react-native';

import { palette } from '../../theme/theme';

export type SegmentedOption<T extends string> = { value: T; label: string };

export type SegmentedTheme = {
  track?: string;         // control background (→ backgroundColor on native)
  trackBorder?: string;   // JS-only hairline around the track
  selected?: string;      // selected-segment colour (→ tintColor on native)
  label?: string;         // unselected label colour
  selectedLabel?: string; // selected label colour
};

export type SegmentedProps<T extends string> = {
  options: ReadonlyArray<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  theme?: SegmentedTheme;
  /**
   * Visual style. 'pill' (default) is the filled-pill track. 'underline' is a
   * left-aligned tab row with a sliding underline under the active label — has no
   * native UISegmentedControl equivalent, so it always renders via the JS path.
   * In underline mode the theme maps as: `selectedLabel` → active label + underline
   * colour, `label` → inactive label colour. (`track`/`selected` are ignored.)
   */
  variant?: 'pill' | 'underline';
  /**
   * Underline-only: stretch the tabs to fill the row, each taking an equal share of the
   * width (the underline then rides the active tab's full half). Off by default (tabs hug
   * their labels, centred). Ignored by the pill variant, whose segments are always flex:1.
   */
  stretch?: boolean;
  /** Outer layout only (margin / flex) — applied to the control container. */
  style?: StyleProp<ViewStyle>;
};

/** Coach ink defaults — a neutral track with a one-step-lighter selected pill. */
export const DEFAULT_SEGMENTED_THEME: Required<Omit<SegmentedTheme, 'trackBorder'>> = {
  track: palette.neutral[800],
  selected: palette.neutral[700],
  label: palette.neutral[300],
  selectedLabel: palette.neutral[50],
};

/** Shared label type face — Inter SemiBold, the app's body font. */
export const SEGMENTED_FONT = 'Inter_600SemiBold';
