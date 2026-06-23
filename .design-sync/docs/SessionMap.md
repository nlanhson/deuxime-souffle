---
category: Map
---

SessionMap — a real map preview for a session location (Fresha "Upcoming" pattern).

Renders an actual slippy map by tiling a minimal light basemap (CARTO Positron) laid out and
clipped to the component's measured size, centred on the session coordinate with our brand pin on
top. Plain <Image> tiles → works in Expo Go with NO native maps module and NO API key. Tapping
opens turn-by-turn directions.

Not pan/zoom interactive — for that, use a native map (expo-maps / react-native-maps), which needs
a development build on Expo SDK 56. PRODUCTION: respect CARTO/OSM attribution + usage policy, or
swap the tile URL for a keyed provider (Mapbox Light / MapTiler), and derive coordinates from the
address. Coordinates here are mock (Lyon 3e).
