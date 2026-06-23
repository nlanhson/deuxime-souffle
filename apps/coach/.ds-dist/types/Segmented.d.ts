import * as React from 'react';
export interface SegmentedProps {
  options: unknown;
  value: unknown;
  onChange: unknown;
  accessibilityLabel?: string;
  theme?: { track?: string; trackBorder?: string; selected?: string; label?: string; selectedLabel?: string; };
  variant?: 'pill' | 'underline';
  stretch?: boolean;
  style?: unknown;
}
export declare const Segmented: React.FC<SegmentedProps>;
