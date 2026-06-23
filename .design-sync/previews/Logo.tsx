import React from 'react';
import { Logo } from 'coach';

const Frame = ({ bg, children }: { bg: string; children: React.ReactNode }) => (
  <div style={{ padding: 32, background: bg, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </div>
);

// Default ink tile on the cream canvas — the login-header / lockup size.
export const OnCanvas = () => (
  <Frame bg="#F7F4EF">
    <Logo size={88} />
  </Frame>
);

// White tile over ink — how the Welcome hero passes color="#FFFFFF".
export const OnInk = () => (
  <Frame bg="#181715">
    <Logo size={88} color="#FFFFFF" />
  </Frame>
);

// Size ramp — splash / lockup / header sizes side by side.
export const SizeRamp = () => (
  <Frame bg="#FFFFFF">
    <Logo size={120} />
    <Logo size={72} />
    <Logo size={44} />
  </Frame>
);

// Glow variant on ink — the red brand glow halo.
export const Glow = () => (
  <Frame bg="#181715">
    <Logo size={96} color="#FFFFFF" glow />
  </Frame>
);
