/**
 * NextSessionDetailModal — the full detail for the coach's NEXT (confirmed) session (C16 / C21).
 *
 * A thin wrapper over ActionModal so tapping the Home hero opens the same modal language as the
 * available-session rows. This is an ASSIGNED session, so unlike the open-session detail it shows
 * the WBS confirmed-session fields in full: EHPAD name, time, address, AND contact person (the
 * on-site person to ask for on arrival). Single CTA = geolocated Check in (with a map pin icon).
 *
 * A SessionMap preview sits at the top (Fresha pattern) and taps through to directions — so the
 * separate Directions button was dropped, leaving one clear action.
 */
import React from 'react';
import { CalendarCheck, MapPin, Clock, DoorOpen, User, Phone, Navigation } from '../icons';

import { palette, color, radius as r } from '../theme/theme';
import { useCopy } from '../i18n';
import { ActionModal } from './ActionModal';
import { SessionMap } from './SessionMap';
import { openDirections } from '../lib/openDirections';
import { callNumber } from '../lib/callNumber';

// "Confirmed" reads as a calm blue status (matches the Home hero's confirmed chip), on a light tint.
const STATUS_CONFIRMED = { fg: palette.bleu[700], bg: 'rgba(123,147,199,0.16)' };

export function NextSessionDetailModal({ visible, onClose, onCheckIn }: { visible: boolean; onClose: () => void; onCheckIn?: () => void }) {
  const copy = useCopy();
  const c = copy.nextSession;
  return (
    <ActionModal
      visible={visible}
      onClose={onClose}
      Icon={CalendarCheck}
      // Notification-center icon treatment (only used when no media is shown).
      accentFg={palette.neutral[900]}
      accentBg="rgba(24,23,21,0.04)"
      media={<SessionMap onPress={() => openDirections(c.address)} a11y={`${c.directions}: ${c.address}`} style={{ borderRadius: r.lg }} />}
      statusPill={{ label: c.detailEyebrow, fg: STATUS_CONFIRMED.fg, bg: STATUS_CONFIRMED.bg }}
      title={c.place}
      // Prominent quick actions — Call the on-site contact, or get Directions (Mobbin: Square Go/Zocdoc).
      quickActions={[
        { Icon: Phone, label: c.callLabel, onPress: () => callNumber(c.phone), a11y: `${c.callA11y}, ${c.phone}` },
        { Icon: Navigation, label: c.directions, onPress: () => openDirections(c.address), a11y: `${c.directions}: ${c.address}` },
      ]}
      // The session facts as scannable rows (icon + label + value); Where taps through to directions,
      // Contact carries the on-site person + their direct line (visible per DT-12; Call chip dials it).
      infoRows={[
        { Icon: Clock, label: c.whenLabel, value: `${c.start} → ${c.end} · ${c.duration}` },
        { Icon: MapPin, label: c.whereLabel, value: c.address, onPress: () => openDirections(c.address), rowA11y: `${c.directions}: ${c.address}` },
        { Icon: DoorOpen, label: c.unitLabel, value: c.unit },
        { Icon: User, label: c.contactLabel, value: c.contact, sub: c.phone },
      ]}
      handover={c.handover}
      primaryLabel={c.checkInCta}
      onPrimary={onCheckIn}
      primaryIcon={<MapPin size={18} color={color.onAction} />}
      closeA11y={c.closeA11y}
    />
  );
}
