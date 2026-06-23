import * as React from 'react';
export interface MultiSelectSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  options: unknown;
  selected: string[];
  onSave: (keys: string[]) => void;
  saveLabel?: string;
  cancelLabel?: string;
  closeA11y?: string;
}
export declare const MultiSelectSheet: React.FC<MultiSelectSheetProps>;
