/**
 * openDirections — hand off to the device's maps app for turn-by-turn directions to an address.
 *
 * iOS opens Apple Maps; everywhere else uses the Google Maps universal URL (which opens the
 * Google Maps app when installed, otherwise the browser). If the platform URL can't be opened
 * we fall back to the universal Google Maps URL.
 *
 * Mock addresses in this app carry a trailing distance hint ("12 Lilac Street, Lyon 3rd · 2.4 km")
 * — `cleanAddress` strips it so only the real address is geocoded.
 */
import { Linking, Platform } from 'react-native';

export function cleanAddress(addr: string): string {
  return addr.split(' · ')[0].trim();
}

export async function openDirections(addr: string): Promise<void> {
  const dest = encodeURIComponent(cleanAddress(addr));
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  const url = Platform.OS === 'ios' ? `http://maps.apple.com/?daddr=${dest}` : googleUrl;
  try {
    await Linking.openURL(url);
  } catch {
    await Linking.openURL(googleUrl);
  }
}
