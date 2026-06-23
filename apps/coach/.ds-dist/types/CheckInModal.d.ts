import * as React from 'react';
export interface CheckInModalProps {
  visible: boolean;
  session: { place: string; time: string; addr?: string; };
  onClose: () => void;
  onConfirmed: (late: boolean) => void;
}
export declare const CheckInModal: React.FC<CheckInModalProps>;
