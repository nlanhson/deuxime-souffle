import * as React from 'react';
export interface AvailableDetailModalProps {
  item: { nm: string; date?: string; hr: string; end?: string; dur?: string; addr?: string; };
  onClose: () => void;
}
export declare const AvailableDetailModal: React.FC<AvailableDetailModalProps>;
