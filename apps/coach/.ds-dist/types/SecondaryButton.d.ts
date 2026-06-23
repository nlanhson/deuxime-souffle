import * as React from 'react';
export interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: unknown;
  accessibilityLabel?: string;
  disabled?: boolean;
}
export declare const SecondaryButton: React.FC<SecondaryButtonProps>;
