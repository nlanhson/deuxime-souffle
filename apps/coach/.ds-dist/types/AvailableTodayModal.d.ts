import * as React from 'react';
export interface AvailableTodayModalProps {
  visible: boolean;
  onClose: () => void;
  items: unknown;
  applied: ReadonlySet<string>;
  onToggle: (nm: string) => void;
}
export declare const AvailableTodayModal: React.FC<AvailableTodayModalProps>;
