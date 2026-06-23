import * as React from 'react';
export interface AbsenceModalProps {
  visible: boolean;
  session: { place: string; time: string; day: string; };
  onClose: () => void;
  onConfirm: unknown;
}
export declare const AbsenceModal: React.FC<AbsenceModalProps>;
