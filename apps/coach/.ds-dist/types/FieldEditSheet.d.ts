import * as React from 'react';
export interface FieldEditSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  fields: unknown;
  choice?: { label: string; options: string[]; value: string; };
  saveLabel?: string;
  cancelLabel?: string;
  onSave: (values: Record<string, string>, choiceValue?: string) => void;
  validate?: (values: Record<string, string>, choiceValue?: string) => string | null;
  closeA11y?: string;
}
export declare const FieldEditSheet: React.FC<FieldEditSheetProps>;
