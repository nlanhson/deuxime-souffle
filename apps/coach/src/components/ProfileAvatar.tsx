/**
 * ProfileAvatar — the coach's account avatar. When a real photo `uri` is provided it renders that
 * human portrait (the default everywhere a coach is shown). Without one it falls back to a soft
 * silhouette glyph: a neutral circle with a white person shape (head + shoulders), the familiar
 * "default account" icon. `size` scales the whole glyph.
 */
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const BG = '#4A4D54'; // dark neutral gray
const FG = '#FFFFFF'; // white silhouette

export function ProfileAvatar({ size = 48, uri }: { size?: number; uri?: string | null }) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: BG }}
        accessibilityIgnoresInvertColors
      />
    );
  }
  return (
    <View
      style={[
        st.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {/* head */}
      <View
        style={{
          width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16,
          backgroundColor: FG, marginTop: size * 0.17,
        }}
      />
      {/* shoulders — a pill whose lower edge is clipped by the circle (overflow: hidden) */}
      <View
        style={{
          width: size * 0.54, height: size * 0.5, borderRadius: size * 0.2,
          backgroundColor: FG, marginTop: size * 0.05,
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  circle: { backgroundColor: BG, overflow: 'hidden', alignItems: 'center' },
});
