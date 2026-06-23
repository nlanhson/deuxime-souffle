import React from 'react';
import { StepProgress } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', width: 320 }}>{children}</div>
);

export const StepOne = () => (
  <Frame><StepProgress current={1} total={2} label="Étape 1 sur 2" /></Frame>
);

export const StepTwo = () => (
  <Frame><StepProgress current={2} total={2} label="Étape 2 sur 2" /></Frame>
);

export const LongerFlow = () => (
  <Frame><StepProgress current={2} total={4} label="Étape 2 sur 4" /></Frame>
);
