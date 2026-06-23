import * as React from 'react';
export interface NotificationCenterProps {
  visible: boolean;
  onClose: () => void;
}
export declare const NotificationCenter: React.FC<NotificationCenterProps>;
