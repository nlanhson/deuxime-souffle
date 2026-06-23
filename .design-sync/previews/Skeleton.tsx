import React from 'react';
import { SkeletonProvider, Skeleton } from 'coach';

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

// Text-line placeholders — title bar plus three body lines, the last shorter.
export const TextLines = () => (
  <Card>
    <SkeletonProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton w={180} h={18} r={6} />
        <Skeleton w={'100%'} h={12} />
        <Skeleton w={'100%'} h={12} />
        <Skeleton w={'60%'} h={12} />
      </div>
    </SkeletonProvider>
  </Card>
);

// Session-card shape — a media block over a couple of text lines.
export const CardBlock = () => (
  <Card>
    <SkeletonProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton w={'100%'} h={120} r={12} />
        <Skeleton w={'70%'} h={16} r={6} />
        <Skeleton w={'40%'} h={12} />
      </div>
    </SkeletonProvider>
  </Card>
);

// Pill / chip placeholders — fully rounded short blocks.
export const Pills = () => (
  <Card>
    <SkeletonProvider>
      <div style={{ display: 'flex', gap: 10 }}>
        <Skeleton w={88} h={28} r={14} />
        <Skeleton w={120} h={28} r={14} />
        <Skeleton w={64} h={28} r={14} />
      </div>
    </SkeletonProvider>
  </Card>
);
