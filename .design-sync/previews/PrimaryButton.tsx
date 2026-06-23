import React from 'react';
import { PrimaryButton } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

export const Default = () => <Frame><div style={{ width: 280 }}><PrimaryButton label="Confirmer la séance" onPress={() => {}} /></div></Frame>;
export const Compact = () => <Frame><div style={{ width: 180 }}><PrimaryButton label="Valider" compact onPress={() => {}} /></div></Frame>;
export const Disabled = () => <Frame><div style={{ width: 280 }}><PrimaryButton label="Indisponible" disabled /></div></Frame>;
