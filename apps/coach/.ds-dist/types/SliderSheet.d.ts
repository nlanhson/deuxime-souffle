import * as React from 'react';
export interface SliderSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  format: (v: number) => string;
  onSave: (v: number) => void;
  saveLabel?: string;
  cancelLabel?: string;
  decA11y?: string;
  incA11y?: string;
  closeA11y?: string;
}
export declare const SliderSheet: React.FC<SliderSheetProps>;
