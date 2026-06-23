import * as React from 'react';
export interface ActionModalProps {
  visible: boolean;
  onClose: () => void;
  Icon: unknown;
  accentFg: string;
  accentBg: string;
  eyebrow?: string;
  title: string;
  body: string;
  steps?: readonly string[];
  note?: string;
  notePhone?: string;
  noteCallA11y?: string;
  handover?: { label: string; meta: string; text: string; };
  primaryLabel: string;
  onPrimary?: () => void;
  primaryIcon?: unknown;
  primaryTone?: 'brand' | 'danger';
  secondaryLabel?: string;
  onSecondary?: () => void;
  closeA11y?: string;
  media?: unknown;
}
export declare const ActionModal: React.FC<ActionModalProps>;
