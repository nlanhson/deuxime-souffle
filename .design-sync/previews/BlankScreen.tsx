import React from 'react';
import { BlankScreen } from 'coach';

// BlankScreen is a full-screen pageSheet Modal ("coming soon" empty state); on web it
// fills its host, so give it a phone-shaped stage. One canonical cell — the prop-driven
// header title sits above a fixed brand "Bientôt disponible" body, so multiple variants
// measure identically through the Modal portal; one representative view is the honest card.
const Stage = ({ children }: { children: React.ReactNode }) => (
  <div style={{ position: 'relative', width: 390, height: 680, overflow: 'hidden', background: '#F7F4EF', borderRadius: 16, border: '1px solid rgba(24,23,21,0.08)' }}>
    {children}
  </div>
);

export const Default = () => (
  <Stage>
    <BlankScreen visible onClose={() => {}} title="Notes de transmission" body="Cet espace n'est pas encore disponible. Vous pourrez bientôt y consigner vos notes après chaque séance." />
  </Stage>
);
