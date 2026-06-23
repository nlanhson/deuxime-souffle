import React from 'react';
import { SkeletonProvider, SkeletonCircle, Skeleton } from 'coach';

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF' }}>
    <div
      style={{
        width: 320,
        background: '#FFFFFF',
        border: '1px solid rgba(24,23,21,0.08)',
        borderRadius: 16,
        padding: 16,
      }}
    >
      {children}
    </div>
  </div>
);

// Avatar placeholders at a few diameters.
export const Sizes = () => (
  <Card>
    <SkeletonProvider>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <SkeletonCircle d={64} />
        <SkeletonCircle d={44} />
        <SkeletonCircle d={28} />
      </div>
    </SkeletonProvider>
  </Card>
);

// List-row shape — circular avatar beside two text lines, as a loading contact row.
export const AvatarRow = () => (
  <Card>
    <SkeletonProvider>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonCircle d={48} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          <Skeleton w={'70%'} h={14} r={6} />
          <Skeleton w={'45%'} h={11} />
        </div>
      </div>
    </SkeletonProvider>
  </Card>
);
