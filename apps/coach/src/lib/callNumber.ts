/**
 * callNumber — place a phone call to the on-site reference person (DT-12).
 *
 * Hands off to the device dialer via a `tel:` URL so the coach can call the EHPAD contact
 * directly from a session detail. Mock numbers are formatted for display ("04 78 30 12 45");
 * we strip everything but digits and a leading "+" before dialing.
 */
import { Linking } from 'react-native';

export async function callNumber(phone: string): Promise<void> {
  const tel = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  try {
    await Linking.openURL(tel);
  } catch {
    // No dialer available (e.g. a tablet / simulator) — fail silently rather than crash.
  }
}
