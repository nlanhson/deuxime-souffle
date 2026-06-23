import React from 'react';
import { GradientFill } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 32, background: '#F7F4EF', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
    {children}
  </div>
);

// The rouge→or CTA fill behind a button label — its primary use.
export const Button = () => (
  <Frame>
    <div style={{ position: 'relative', width: 260, height: 52, borderRadius: 14, overflow: 'hidden', background: '#E4572E' }}>
      <GradientFill radius={14} />
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 16,
          color: '#FFFFFF',
        }}
      >
        Confirmer la séance
      </div>
    </div>
  </Frame>
);

// Circular fill — the radius=999 "Raise hand" action variant.
export const Circular = () => (
  <Frame>
    <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 999, overflow: 'hidden', background: '#E4572E' }}>
      <GradientFill radius={999} />
    </div>
  </Frame>
);

// Bare swatch — the gradient ramp itself, rouge at 70% into or.
export const Swatch = () => (
  <Frame>
    <div style={{ position: 'relative', width: 220, height: 120, borderRadius: 16, overflow: 'hidden', background: '#E4572E' }}>
      <GradientFill radius={16} />
    </div>
  </Frame>
);
