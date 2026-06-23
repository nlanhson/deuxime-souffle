import * as React from 'react';
export interface HalfDayScheduleSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  help?: string;
  days: readonly string[];
  amLabel: string;
  pmLabel: string;
  value: { [x: string]: { am: boolean; pm: boolean; }; };
  onSave: unknown;
  saveLabel?: string;
  cancelLabel?: string;
  closeA11y?: string;
}
export declare const HalfDayScheduleSheet: React.FC<HalfDayScheduleSheetProps>;
