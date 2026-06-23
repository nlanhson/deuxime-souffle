import React from 'react';
import { Reveal, SkeletonProvider, Skeleton } from 'coach';

const Stage = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF' }}>
    <div
      style={{
        position: 'relative',
        width: 320,
        height: 200,
        background: '#FFFFFF',
        border: '1px solid rgba(24,23,21,0.08)',
        borderRadius: 16,
        padding: 16,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {children}
    </div>
  </div>
);

const skeleton = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <Skeleton w={'100%'} h={80} r={12} />
    <Skeleton w={'70%'} h={16} r={6} />
    <Skeleton w={'40%'} h={12} />
  </div>
);

const Content = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Inter, system-ui, sans-serif', color: '#181715', width: '100%' }}>
    <div style={{ height: 80, borderRadius: 12, background: 'linear-gradient(135deg,#E4572E,#F2A65A)' }} />
    <div style={{ fontWeight: 700, fontSize: 16 }}>Séance de mobilité douce</div>
    <div style={{ fontSize: 13, color: '#6B6660' }}>Mardi 14h · Résidence Les Tilleuls</div>
  </div>
);

// Loaded state — the real content fully revealed (skeleton has faded out).
export const Loaded = () => (
  <Stage>
    <Reveal loading={false} skeleton={skeleton}>
      <Content />
    </Reveal>
  </Stage>
);

// Loading state — the layout-matching skeleton sits on top of the (hidden) content.
export const Loading = () => (
  <Stage>
    <Reveal loading skeleton={skeleton}>
      <Content />
    </Reveal>
  </Stage>
);
