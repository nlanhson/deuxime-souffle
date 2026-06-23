import * as React from 'react';
export interface BlankScreenProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
  Icon?: unknown;
}
export declare const BlankScreen: React.FC<BlankScreenProps>;
