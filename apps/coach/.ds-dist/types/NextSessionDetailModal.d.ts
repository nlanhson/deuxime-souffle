import * as React from 'react';
export interface NextSessionDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onCheckIn?: () => void;
}
export declare const NextSessionDetailModal: React.FC<NextSessionDetailModalProps>;
