import React from 'react';
import { SecondaryButton } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

export const Default = () => (
  <Frame><div style={{ width: 280 }}><SecondaryButton label="Annuler la séance" onPress={() => {}} /></div></Frame>
);

export const FullWidth = () => (
  <Frame><div style={{ width: 360 }}><SecondaryButton label="Plus tard" style={{ width: '100%' }} onPress={() => {}} /></div></Frame>
);

export const Disabled = () => (
  <Frame><div style={{ width: 280 }}><SecondaryButton label="Indisponible" disabled /></div></Frame>
);
