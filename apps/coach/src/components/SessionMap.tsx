/**
 * SessionMap — a real map preview for a session location (Fresha "Upcoming" pattern).
 *
 * Renders an actual slippy map by tiling a minimal light basemap (CARTO Positron) laid out and
 * clipped to the component's measured size, centred on the session coordinate with our brand pin on
 * top. Plain <Image> tiles → works in Expo Go with NO native maps module and NO API key. Tapping
 * opens turn-by-turn directions.
 *
 * Not pan/zoom interactive — for that, use a native map (expo-maps / react-native-maps), which needs
 * a development build on Expo SDK 56. PRODUCTION: respect CARTO/OSM attribution + usage policy, or
 * swap the tile URL for a keyed provider (Mapbox Light / MapTiler), and derive coordinates from the
 * address. Coordinates here are mock (Lyon 3e).
 */
import React from 'react';
import { View, Image, Pressable, StyleSheet, type StyleProp, type ViewStyle, type LayoutChangeEvent } from 'react-native';
import { MapPin } from '../icons';
import { palette, color } from '../theme/theme';

const TILE = 256;
const ZOOM = 15; // ~neighbourhood level — streets readable around the pin
const SESSION_COORD = { lat: 45.7548, lon: 4.852 };

// Minimal light basemap (CARTO Positron), retina @2x for crispness. Swap the style segment for a
// different look: 'light_all' (light + labels), 'light_nolabels' (cleanest), 'dark_all'.
const TILE_STYLE = 'light_all';
const tileUrl = (z: number, x: number, y: number) => `https://a.basemaps.cartocdn.com/${TILE_STYLE}/${z}/${x}/${y}@2x.png`;

// Web-Mercator: fractional tile coordinates for a lat/lon at a given zoom.
const lonToTileX = (lon: number, z: number) => ((lon + 180) / 360) * Math.pow(2, z);
const latToTileY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * Math.pow(2, z);
};

// Lay raster tiles to fill a w×h viewport centred on the session coordinate.
function MapTiles({ w, h }: { w: number; h: number }) {
  const n = Math.pow(2, ZOOM);
  const cx = lonToTileX(SESSION_COORD.lon, ZOOM) * TILE; // centre, in global pixels
  const cy = latToTileY(SESSION_COORD.lat, ZOOM) * TILE;
  const left = cx - w / 2; // global pixel at the viewport's left/top edge
  const top = cy - h / 2;

  const tiles: { key: string; x: number; y: number; uri: string }[] = [];
  for (let tx = Math.floor(left / TILE); tx <= Math.floor((left + w) / TILE); tx++) {
    for (let ty = Math.floor(top / TILE); ty <= Math.floor((top + h) / TILE); ty++) {
      if (ty < 0 || ty >= n) continue;
      const wx = ((tx % n) + n) % n; // wrap longitude
      tiles.push({
        key: `${tx}_${ty}`,
        x: tx * TILE - left,
        y: ty * TILE - top,
        uri: tileUrl(ZOOM, wx, ty),
      });
    }
  }
  return (
    <>
      {tiles.map((t) => (
        <Image key={t.key} source={{ uri: t.uri }} style={{ position: 'absolute', left: t.x, top: t.y, width: TILE, height: TILE }} />
      ))}
    </>
  );
}

export function SessionMap({ onPress, a11y, style }: {
  onPress: () => void;
  a11y: string;
  style?: StyleProp<ViewStyle>; // caller controls height / corner radius
}) {
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width && height && (width !== size.w || height !== size.h)) setSize({ w: width, h: height });
  };
  return (
    <Pressable
      onPress={onPress}
      onLayout={onLayout}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={[st.map, style]}
    >
      {size.w > 0 && size.h > 0 ? <MapTiles w={size.w} h={size.h} /> : null}
      {/* Our own brand pin, centred on the session coordinate. */}
      <View style={st.pinWrap} pointerEvents="none">
        <View style={st.pin}>
          <MapPin size={18} color={palette.neutral[0]} />
        </View>
      </View>
    </Pressable>
  );
}

const st = StyleSheet.create({
  // Light placeholder behind tiles still loading, matched to Positron's land tone so gaps read as
  // map (not a dark "broken" block) on the now-light basemap.
  map: { width: '100%', height: 168, overflow: 'hidden', backgroundColor: '#E9E9EA' },
  pinWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  pin: {
    width: 34, height: 34, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.action,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 5,
  },
});
