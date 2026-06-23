import React from 'react';
import { ProfileAvatar } from 'coach';

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 24, background: '#F7F4EF', maxWidth: 380 }}>{children}</div>
);

// Canonical: a real coach portrait at the default header size.
export const Photo = () => (
  <Frame>
    <ProfileAvatar
      size={64}
      uri="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces"
    />
  </Frame>
);

// Fallback: no photo → the neutral silhouette glyph (default account icon).
export const Silhouette = () => (
  <Frame>
    <ProfileAvatar size={64} />
  </Frame>
);

// Size axis — the same silhouette scales as a whole (list row → profile hero).
export const Sizes = () => (
  <Frame>
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      <ProfileAvatar size={32} />
      <ProfileAvatar size={48} />
      <ProfileAvatar size={72} />
    </div>
  </Frame>
);
