import * as React from 'react';
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  a11yLabel?: string;
  dismissable?: boolean;
  children: unknown;
  contentStyle?: unknown;
}
export declare const BottomSheet: React.FC<BottomSheetProps>;
