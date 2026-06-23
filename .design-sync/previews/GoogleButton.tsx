import React from 'react';
import { GoogleButton } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
);

export const Default = () => (
  <Frame><div style={{ width: 320 }}><GoogleButton label="Continuer avec Google" onPress={() => {}} /></div></Frame>
);

export const SignIn = () => (
  <Frame><div style={{ width: 320 }}><GoogleButton label="Se connecter avec Google" onPress={() => {}} /></div></Frame>
);
