/**
 * NextSessionDetailModal — the full detail for the coach's NEXT (confirmed) session (C16 / C21).
 *
 * A thin wrapper over ActionModal so tapping the Home hero opens the same modal language as the
 * available-session rows. This is an ASSIGNED session, so unlike the open-session detail it shows
 * the WBS confirmed-session fields in full: EHPAD name, time, address, AND contact person (the
 * on-site person to ask for on arrival). Primary = geolocated Check in, secondary = Directions.
 */
import React from 'react';
import { CalendarCheck } from '../icons';

import { palette } from '../theme/theme';
import { copy } from '../copy';
import { ActionModal } from './ActionModal';
import { openDirections } from '../lib/openDirections';

export function NextSessionDetailModal({ visible, onClose, onCheckIn }: { visible: boolean; onClose: () => void; onCheckIn?: () => void }) {
  const c = copy.nextSession;
  return (
    <ActionModal
      visible={visible}
      onClose={onClose}
      Icon={CalendarCheck}
      // Notification-center icon treatment: white glyph on a very dim wash (not the status accent).
      accentFg={palette.neutral[50]}
      accentBg="rgba(255,255,255,0.05)"
      eyebrow={c.detailEyebrow}
      title={c.place}
      body={`${c.start} → ${c.end} · ${c.duration}\n${c.address}\n${c.unitLabel}: ${c.unit}`}
      note={c.contact}
      primaryLabel={c.checkInCta}
      onPrimary={onCheckIn}
      secondaryLabel={c.directions}
      onSecondary={() => openDirections(c.address)}
      closeA11y={c.closeA11y}
    />
  );
}
