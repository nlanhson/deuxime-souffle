import * as React from 'react';
export interface OptionSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  options: unknown;
  selectedKey?: string;
  onSelect: (key: string) => void;
  closeA11y?: string;
}
export declare const OptionSheet: React.FC<OptionSheetProps>;
