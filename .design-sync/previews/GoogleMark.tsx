import React from 'react';
import { GoogleMark } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: '#FFFFFF', display: 'flex', gap: 28, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
    {children}
  </div>
);

// The official 4-colour "G" at a comfortable read size.
export const Default = () => (
  <Frame>
    <GoogleMark size={64} />
  </Frame>
);

// Size ramp — stays crisp from button-icon size up to a feature mark.
export const SizeRamp = () => (
  <Frame>
    <GoogleMark size={96} />
    <GoogleMark size={48} />
    <GoogleMark size={24} />
  </Frame>
);

// In context — paired with the "Sign in with Google" label as the button uses it.
export const InButton = () => (
  <Frame>
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 20px',
        border: '1px solid rgba(24,23,21,0.12)',
        borderRadius: 12,
        background: '#FFFFFF',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 600,
        fontSize: 16,
        color: '#181715',
      }}
    >
      <GoogleMark size={20} />
      Continuer avec Google
    </div>
  </Frame>
);
