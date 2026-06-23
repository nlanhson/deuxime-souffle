import * as React from 'react';
export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: unknown;
  accessibilityLabel?: string;
  disabled?: boolean;
  compact?: boolean;
  icon?: unknown;
}
export declare const PrimaryButton: React.FC<PrimaryButtonProps>;
