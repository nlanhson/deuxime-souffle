import React from 'react';
import { NotificationCenter } from 'coach';

// The notification center is a full-screen pageSheet modal; on web it fills its host.
// Give it a tall, phone-width stage so the list and header read in full.
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      position: 'relative',
      width: 390,
      height: 760,
      overflow: 'hidden',
      background: '#F7F4EF',
      borderRadius: 16,
      border: '1px solid rgba(24,23,21,0.08)',
    }}
  >
    {children}
  </div>
);

// Canonical: the center open, with the seeded unread + earlier sections.
export const Open = () => (
  <Stage>
    <NotificationCenter visible onClose={() => {}} />
  </Stage>
);
