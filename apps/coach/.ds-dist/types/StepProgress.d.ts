import * as React from 'react';
export interface StepProgressProps {
  current: number;
  total: number;
  label: string;
  style?: unknown;
}
export declare const StepProgress: React.FC<StepProgressProps>;
