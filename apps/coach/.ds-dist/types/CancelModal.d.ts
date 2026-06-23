import * as React from 'react';
export interface CancelModalProps {
  visible: boolean;
  session: { place: string; time: string; day: string; startsInH?: number; };
  onClose: () => void;
  onConfirm: () => void;
}
export declare const CancelModal: React.FC<CancelModalProps>;
