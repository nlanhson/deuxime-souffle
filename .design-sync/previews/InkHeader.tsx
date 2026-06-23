import React from 'react';
import { InkHeader, ProfileAvatar } from 'coach';

// InkHeader is the dark "ink" hero band (#181715). Frame it on the brand cream so the
// rounded-bottom panel and its white-on-ink text read as the band they normally anchor.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: '#F7F4EF', maxWidth: 390, padding: 16 }}>{children}</div>
);

// Ink-light text tokens (RN colour doesn't cascade, so set per element).
const titleStyle: React.CSSProperties = {
  fontFamily: 'Inter_500Medium, Inter, sans-serif',
  fontSize: 26,
  fontWeight: 500,
  color: '#FFFFFF',
  margin: 0,
  lineHeight: 1.15,
};
const subStyle: React.CSSProperties = {
  fontFamily: 'Inter_400Regular, Inter, sans-serif',
  fontSize: 15,
  color: '#C6BDAE',
  margin: '6px 0 0',
};

// Canonical: a tab screen header — title + subtitle on the ink band.
export const Tab = () => (
  <Frame>
    <InkHeader variant="tab">
      <div>
        <h1 style={titleStyle}>Bonjour, Camille</h1>
        <p style={subStyle}>3 séances cette semaine</p>
      </div>
    </InkHeader>
  </Frame>
);

// Sheet variant — less top inset (a pageSheet modal is already below the status bar).
export const Sheet = () => (
  <Frame>
    <InkHeader variant="sheet">
      <div>
        <h1 style={titleStyle}>Mon profil</h1>
        <p style={subStyle}>Coach sport-santé · Lyon 3e</p>
      </div>
    </InkHeader>
  </Frame>
);

// With an avatar — the band pairs the coach portrait with their greeting.
export const WithAvatar = () => (
  <Frame>
    <InkHeader variant="sheet">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <ProfileAvatar
          size={52}
          uri="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces"
        />
        <div>
          <h1 style={{ ...titleStyle, fontSize: 22 }}>Camille Renaud</h1>
          <p style={subStyle}>Niveau 4 · 1 240 points</p>
        </div>
      </div>
    </InkHeader>
  </Frame>
);
